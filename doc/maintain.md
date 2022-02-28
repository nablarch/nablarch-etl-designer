# ビルド方法
JavaアプリケーションのビルドにMavenが必要になります

## ETLデザイナーを起動する

```
git submodule update -i
npm install
cd bpmn-parser
mvn clean package
cd ..
node_modules/.bin/grunt build
node_modules/.bin/electron . --dev
```
## exeファイルにパッケージングする

```
git submodule update -i
npm install
cd bpmn-parser
mvn clean package
cd ..
node_modules/.bin/grunt build
node build.js
```