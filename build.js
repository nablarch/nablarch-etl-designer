var packager = require('electron-packager');
var packageInfo = require('./package.json');

packager({
  name: packageInfo['name'],
  icon: './etl/resources/jobedit.ico',
  dir: '.',
  out: '../dist',
  platform: 'win32',
  arch: 'all',
  electronVersion: '1.6.11',
  overwrite: true,
  asar: false,
  appVersion: packageInfo['version'],
  appCopyright: '© Copyright 2017, TIS Inc.',
  win32metadata: {
    CompanyName: '',
    FileDescription: packageInfo['name'],
    OriginalFilename: packageInfo['name']+'.exe',
    ProductName: packageInfo['name'],
    InternalName: packageInfo['name']
  },
  ignore: ['doc', 'test', 'bpmn-parser', '.idea']

}, function (err, appPaths) {
  if (err) {
    console.log(err);
  }
  console.log('Done: ' + appPaths);
});