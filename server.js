const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const GIF_DIR = path.join(ROOT, "GIF");
const SELECTED_GIFS = (process.env.GIF || process.env.GIFS || "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);
const syncEpoch = Date.now();

fs.mkdirSync(GIF_DIR, { recursive: true });

function listGifs() {
  return fs
    .readdirSync(GIF_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".gif"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function selectedGifs() {
  const gifs = listGifs();
  if (!SELECTED_GIFS.length) return gifs.slice(0, 1);

  const gifSet = new Set(gifs);
  return SELECTED_GIFS.filter((name) => gifSet.has(name));
}

app.disable("x-powered-by");

app.use(
  express.static(PUBLIC_DIR, {
    etag: false,
    maxAge: 0
  })
);

app.use(
  "/gifs",
  express.static(GIF_DIR, {
    immutable: false,
    maxAge: "1m"
  })
);

app.get("/api/gifs", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    gifs: selectedGifs(),
    selectedBy: SELECTED_GIFS.length ? "server-config" : "first-gif"
  });
});

app.get("/api/sync", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    serverTime: Date.now(),
    epoch: syncEpoch
  });
});

app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store",
    Connection: "keep-alive"
  });

  const send = () => {
    res.write("event: sync\n");
    res.write(`data: ${JSON.stringify({ serverTime: Date.now(), epoch: syncEpoch })}\n\n`);
  };

  send();
  const timer = setInterval(send, 1000);
  req.on("close", () => clearInterval(timer));
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Synced GIF viewer: http://localhost:${PORT}`);
  console.log(`Put GIF files in: ${GIF_DIR}`);
});
