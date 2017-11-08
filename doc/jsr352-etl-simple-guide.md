## JSR352とETLの簡単な説明
ここでは、ETL/ETLデザイナーを利用するにあたって、必要となるJSR352とETLの知識について簡単に説明します。

- [JSR352](#jsr352)
- [ETL](#etl)

## JSR352
- Jobは1個のバッチ処理を表します。なので、Jobが実行単位になります。
- Jobは一つ以上のStepが含まれます。StepによりJobの処理フローを表します。
- Stepの処理方法にはChunkとBatchletの2種類があります。
- Chunkは1件ずつ読み込み(ItemReader)と処理(ItemProcessor)を行い、一定件数毎に書き込み(ItemWriter)をまとめて行います。

  ![](image/chunk.png)
  
- Batchletは一つの処理で完結するタスク指向の処理を行います。

  ![](image/batchlet.png)
  
## ETL

NablarchのETLでは、JSR352に準拠したバッチアプリケーションに、ChunkやBatchletの実装を追加する形でETLを実現しています。  
ETLで提供しているChunkやBatchletの詳細は[解説書](https://nablarch.github.io/docs/LATEST/doc/extension_components/etl/index.html)を参照ください。
  
- ファイル→DBのデータ取り込みのバッチをETL

  ![](image/etl-flow.png)
  
- 各ステップで使用されるItemReader、ItemProcessor、ItemWriter、Batchletは以下のようになります。

  ![](image/etl-flow-batch-artifact.png)
  
- ETLではファイル、DBの入出力やデータのバリデーションなど、定型的な処理を行うItemReader、ItemWriter、Batchletを提供してあります。(ItemProcessorは行いたい処理内容を実装する必要あります)
- これらのItemReader、ItemProcessor、ItemWriter、Batchletが処理するファイルとDBの構造をJava Beanとして作成し、設定します。
- ワークテーブルから本テーブルへの取り込みの際、取り込むデータの抽出と変換仕様をSQLで作成し、設定します。

  ![](image/etl-flow-bean-sql.png)
  
- Stepの処理の流れ、Stepの処理の内容(ItemReader、ItemProcessor、ItemWriter、Batchlet)、Bean、SQLを設定ファイルに記述します。
- ETLデザイナーはGUIで上記の設定を行い、設定ファイルが出力できます。