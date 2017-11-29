# ビルド方法

## ETLデザイナーを起動する

```
git submodule update -i
npm install
node_modules/.bin/grunt auto-build

別コンソールで実行
node_modules/.bin/electron . --dev
```
## exeファイルにパッケージングする

```
git submodule update -i
npm install
node_modules/.bin/grunt build
npm run package
```