var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var dialog = electron.dialog;
var ipc = electron.ipcMain;

var path = require('path');
var url = require('url');
var fs = require('fs');

var Menu = electron.Menu;

var ApplicationMenu = require('./ApplicationMenu');
var ConfigFileUtil = require('../renderer/util/ConfigFileUtil');

var appInfo = {
  isNewFile: true,
  openFilePath: '',
  tempFilePath: ''
};

global.appInfo = appInfo;


var win;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  if (ConfigFileUtil.isDevelop()) {
    win.openDevTools();
  }

  createApplicationMenu(win);

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('close', function (event) {
    win.webContents.send('main-process-window-close');
    event.preventDefault();
  });

  win.on('closed', function () {
    win = null;
  });
}

function createApplicationMenu(window) {
  var template = new ApplicationMenu(window).template;

  var menu = Menu.buildFromTemplate(template);
  win.setMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', function (event) {
  //tempファイルを削除
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (win === null) {
    createWindow();
  }
});

ipc.on('renderer-process-post-close', function (event, args) {

  if (isDirty()) {
    var options = {
      buttons: ['はい', 'いいえ', 'キャンセル'],
      message: '編集されています。保存して終了しますか？'
    };
    var result = dialog.showMessageBox(options);
    switch (result) {
      case 0:
        // save
        if (!global.appInfo.isNewFile) {
          win.webContents.send('main-process-dirty-save', {
            fileName: global.appInfo.openFilePath,
            isClose: true
          });
        }else{
          var focusedWindow = BrowserWindow.getFocusedWindow();
          var options = {
            title: '名前を付けて保存',
            defaultPath: '',
            filters: [{
              name: 'bpmnファイル',
              extensions: ['bpmn']
            }]
          };

          dialog.showSaveDialog(focusedWindow, options, function (fileName) {
            if (fileName) {
              global.appInfo.openFilePath = fileName;
              global.appInfo.isNewFile = false;
              win.webContents.send('main-process-dirty-save', {
                fileName: fileName,
                isClose: true
              });
            }
          });
        }
        return;
      case 1:
        // nop
        break;
      case 2:
        return;
    }
  }
  cleanUpTempDir();
  win = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipc.on('renderer-process-post-close-save', function (event) {
  cleanUpTempDir();
  win = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function cleanUpTempDir() {
  var tempDir = 'bpmn-temp';
  if(fs.existsSync(tempDir)) {
    removeDir(tempDir);
  }
}

function removeDir(directory) {
  var files = fs.readdirSync(directory);
  for (var key in files) {
    var childPath = directory + '/' + files[key];
    if (fs.statSync(childPath).isDirectory()) {
      removeDir(childPath)
    } else {
      fs.unlinkSync(childPath);
    }
  }
  fs.rmdirSync(directory);
}

function isDirty() {
  var openData = '';
  var tempData = '';
  if (appInfo.openFilePath !== '' && fs.existsSync(appInfo.openFilePath)) {
    openData = fs.readFileSync(appInfo.openFilePath, 'utf8');
  }
  if (appInfo.tempFilePath !== '' && fs.existsSync(appInfo.tempFilePath)) {
    tempData = fs.readFileSync(appInfo.tempFilePath, 'utf8');
  }
  return (openData !== tempData);
}
