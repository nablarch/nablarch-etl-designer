# セットアップガイド
- インストール
- 設定ファイル
- アンインストール

## インストール
- ETLデザイナー
    - zipファイルをダウンロードし、任意の場所に解凍します。
    - 解凍したフォルダ内のetl-designer.exeを実行するとETLデザイナーが起動します。
        
## 設定ファイル
- ETLデザイナーでは、アプリの設定を[json形式](http://www.json.org/json-ja.html)の設定ファイルに保存しています。
- 設定ファイルを編集した後は、ETLデザイナーを終了して再度起動することで、変更した設定が反映されます。
- ※設定ファイルは、windows標準のメモ帳で開くとレイアウトが崩れます。別のテキストエディタを使用してください。
- ※設定ファイルがjson形式の文法に沿っていない場合、ETLデザイナーが正常に動作しません。編集する際は[visual studio code](https://code.visualstudio.com/)など、json形式の文法をチェックできるエディタの仕様を推奨します。
- 3種類の設定ファイルがあります。
    - registry.json：以下の設定ファイルのパス
    - appConfig.json：ETLデザイナー自体の設定（サーバの接続情報など）
    - propertiesConfig.json：ジョブ定義に使用するプロジェクト固有の設定
- registry.jsonは、etl-designer.exeと同じ階層に作成してください。
- 参照したいappConfig.jsonとpropertiesConfig.jsonのパスを指定してください。
- ※json形式のため、Windowsの区切り文字である「¥」はエスケープして記述する必要があります。
- registry.json
```
{
    "appConfig": "C:\\Users\\username\\AppData\\Roaming\\etl-designer\\appConfig.json",
    "propertiesConfig": "C:\\Users\\username\\AppData\\Roaming\\etl-designer\\propertiesConfig.json"
}
```
- ※appConfig.jsonとpropertiesConfig.jsonは、OS別に以下の場所が初期配置場所になります。
    - Windows: %APPDATA%¥etl-designer
    - Linux: $XDG_CONFIG_HOME/etl-designer or ~/.config/etl-designer
    - macOS: ~/Library/Application Support/etl-designer 
- ※各種設定ファイルは、ETLデザイナー起動時に初期配置場所にファイルがなければ自動で生成されます。

- appConfig.json
```
{
    "jobStreamer": {
       "url": "https://alfort.adc-tis.com/job-streamer-control-bus",
       "timeoutCount": 20
    },
    "locale": "ja",
    "xmlAttr": {
        "xmlns": "http://xmlns.jcp.org/xml/ns/javaee",
        "version": "1.0"
    }
}
```
- ETLデザイナーの設定が記述されています。
    - jobStreamer：APIサーバの設定
        - url: apiサーバのurl
        - timeoutCount: ジョブのテスト実行結果を取得しに行く回数(この回数を超えるとapiアクセスをタイムアウトさせる)
    - Locale：ETLデザイナーの言語設定
        - en（英語）とja（日本語）の2言語が選択可
    - xmlAttr：出力されるジョブxmlのjob要素に指定する属性
        - xmlns
        - version

- propertiesConfig.json
```
{
    "batchlet": [
        "tableCleaningBatchlet",
        "sqlLoaderBatchlet",
        "validationBatchlet"
    ],
    "itemReader": [
        "databaseItemReader",
        "fileItemReader"
    ],
    "itemWriter": [
        "databaseItemWriter",
        "fileItemWriter"
    ],
    "itemProcessor": [],
    "listener": [
        "nablarchJobListenerExecutor",
        "nablarchStepListenerExecutor",
        "nablarchItemWriteListenerExecutor",
        "progressLogListener"
    ],
    "entities": [
        "com.nablarch.example.app.batch.ee.dto.csv.ZipCodeDto"
    ],
    "bean": [
        "com.nablarch.example.app.batch.ee.dto.csv.ZipCodeDto",
        "com.nablarch.example.app.entity.ZipCodeData"
    ],
    "errorEntity": [
        "com.nablarch.example.app.batch.ee.dto.csv.ZipCodeErrorEntity"
    ],
    "mode": [
        "ABORT",
        "CONTINUE"
    ],
    "columns": [],
    "insertMode": [
        "NORMAL",
        "ORACLE_DIRECT_PATH"
    ],
    "stepType": {
        "truncate": [
            "entities"
        ],
        "validation": [
            "bean",
            "errorEntity",
            "mode",
            "errorLimit"
        ],
        "file2db": [
            "fileName",
            "bean"
        ],
        "db2db": [
            "extractBean",
            "bean",
            "sqlId",
            "mergeOnColumns",
            "insertMode",
            "updateSize"
        ],
        "db2file": [
            "bean",
            "fileName",
            "sqlId"
        ]
    }
}
```
- ジョブ定義時に使用するバッチコンポーネント、 ETL利用時に必要なbean、entityなどが記述されています。
- このファイルに記述することで、ETLデザイナー上で プルダウンから選択できるようになります。
- バッチで使用するクラス
    - batchlet
    - itemReader
    - itemWriter
    - itemProcessor
    - listener
- ETL使用時に設定する項目
    - entities
    - bean
    - errorEntity
    - mode
    - columns
    - insertMode
- ※stepType以下の項目は編集しないでください。

## アンインストール
- etl-designer.exeをフォルダごと削除してください
- %APPDATA%\etl-designerフォルダに設定ファイルが残っているため、こちらのフォルダも削除してください