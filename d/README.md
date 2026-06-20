# Synced GIF Viewer

`GIF` フォルダーに入れた `.gif` ファイルを、サーバー時刻に合わせて全端末で同じフレーム表示にするビューアです。

## 使い方

1. `GIF` フォルダーに表示したい `.gif` ファイルを入れます。
2. サーバーを起動します。

```bash
npm start
```

別のポートで起動したい場合:

```bash
PORT=5177 npm start
```

表示するGIFをサーバー側で指定したい場合:

```bash
GIF=sample.gif PORT=5177 npm start
```

複数指定する場合:

```bash
GIFS=sample.gif,other.gif PORT=5177 npm start
```

指定しない場合は、`GIF` フォルダー内の先頭1つだけを表示します。

3. 同じ端末では `http://localhost:3000` を開きます。
4. 他の端末から見る場合は、サーバーを動かしている端末のIPアドレスで `http://IPアドレス:3000` を開きます。

## Renderで公開する

1. このフォルダーをGitHubリポジトリに入れてpushします。
2. Renderで「New」→「Web Service」を選び、そのリポジトリを接続します。
3. 設定は次のままで使えます。

```text
Build Command: npm install
Start Command: npm start
```

`render.yaml` も入れてあるので、RenderのBlueprintとして作ることもできます。

Renderでは `PORT` は自動で設定されます。自分で固定する必要はありません。

表示GIFを固定したい場合は、RenderのEnvironment Variablesに追加します。

```text
GIF=sample.gif
```

複数指定:

```text
GIFS=sample.gif,other.gif
```

## 仕組み

通常の `<img>` GIF再生では端末ごとの読み込みタイミングでズレるため、このアプリはGIFをブラウザ側でフレームに分解し、サーバーが配る時刻を基準に現在のフレームを決めてキャンバスへ描画します。
