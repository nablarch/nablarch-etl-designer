var electron = require('electron');
var dialog = electron.dialog;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;

var url = require('url');
var path = require('path');
var fs = require('fs');

var ConfigFileUtil = require('../renderer/util/ConfigFileUtil');

var ApplicationMenu = function (win) {

  this.template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新規作成',
          // accelerator: 'Ctrl+N',
          click: function (item, focufocusedWindow) {
            win.webContents.send('main-process-save-temp-file', {
              action: 'newFile'
            });
          }
        },
        {
          label: '上書き保存',
          accelerator: 'Ctrl+S',
          click: function (item, focusedWindow) {
            if (!global.appInfo.isNewFile) {
              win.webContents.send('main-process-save-file', {
                fileName: global.appInfo.openFilePath
              });
            } else {
              var focusedWindow = BrowserWindow.getFocusedWindow();
              var options = {
                title: '名前を付けて保存',
                defaultPath: getDefaultPath(),
                filters: [{
                  name: 'bpmnファイル',
                  extensions: ['bpmn']
                }]
              };

              var filePath = dialog.showSaveDialog(focusedWindow, options);
              if (filePath) {
                global.appInfo.openFilePath = filePath;
                global.appInfo.isNewFile = false;
                win.webContents.send('main-process-save-file', {
                  fileName: filePath
                });
              }
            }
          }
        },
        {
          label: '名前を付けて保存',
          click: function (item, focusedWindow) {
            var focusedWindow = BrowserWindow.getFocusedWindow();
            var options = {
              title: '名前を付けて保存',
              defaultPath: getDefaultPath(),
              filters: [{
                name: 'bpmnファイル',
                extensions: ['bpmn']
              }]
            };

            var filePath = dialog.showSaveDialog(focusedWindow, options);
            if (filePath) {
              global.appInfo.openFilePath = filePath;
              global.appInfo.isNewFile = false;
              win.webContents.send('main-process-save-file', {
                fileName: filePath
              });
            }
          }
        },
        {
          label: '開く',
          // accelerator: 'Ctrl+O',
          click: function (item, focusedWindow) {
            win.webContents.send('main-process-save-temp-file', {
              action: 'openFile'
            });
          }
        },
        {
          label: '終了',
          click: function(item, focusedWindow) {
            win.webContents.send('main-process-save-temp-file', {
              action: 'close'
            });
          }
        }
      ]
    },
    {
      label: 'ツール',
      submenu: [
        {
          label: '変換',
          click: function (item, focusedWindow) {
            // win.webContents.send('main-process-save-temp-file', {
            //   action: 'exportFile'
            // });
            win.webContents.send('main-process-export');
          }
        },
        // {
        //   label: 'テスト実行'
        // },
        {
          label: '設定',
          accelerator: 'Ctrl+Shift+S',
          click: function () {
            var win = new BrowserWindow(
                {
                  width: 400, height: 500,
                  parent: win, resizable: false,
                  modal: true, frame: true
                });
            win.setMenu(null);

            win.loadURL(url.format({
              pathname: path.join(__dirname, '../../dist/setting-dialog/setting.html'),
              protocol: 'file:',
              slashes: true
            }));
          }
        }
      ]
    }
    // {
    //   label: 'ヘルプ',
    //   submenu: [
    //     {
    //       label: 'バージョン確認'
    //     }
    //   ]
    // }
   ];

  if (ConfigFileUtil.isDevelop()) {
    this.template.push(
        {
          label: 'develop',
          submenu: [
            {
              label: '&Reload',
              accelerator: 'Ctrl+R',
              role: 'reload'
            },
            {
              label: 'Toggle &Full Screen',
              accelerator: 'F11',
              role: 'togglefullscreen'
            },
            {
              label: 'Toggle &Developer Tools',
              accelerator: 'Shift+Ctrl+I',
              role: 'toggledevtools'
            }
          ]
        }
    );
  }

  ipc.on('renderer-process-post-new-file', function(event, args){
    if (!handleDirty()) {
      return;
    }
    global.appInfo.openFilePath = '';
    global.appInfo.tempFilePath = '';
    global.appInfo.isNewFile = true;
    win.webContents.send('main-process-new-file');
  });

  ipc.on('renderer-process-post-open-file', function(event, args){
    if (!handleDirty()) {
      return;
    }
    var focusedWindow = BrowserWindow.getFocusedWindow();
    var options = {
      properties: ['openFile'],
      filters: [{
        name: 'bpmnファイル',
        extensions: ['bpmn']
      }]
    };
    var filePath = dialog.showOpenDialog(focusedWindow, options);
    if (filePath) {
      global.appInfo.openFilePath = filePath[0];
      global.appInfo.tempFilePath = '';
      global.appInfo.isNewFile = false;
      win.webContents.send('main-process-load-file', {
        file: filePath[0]
      });
    }
  });

  ipc.on('renderer-process-post-export-file', function(event, args){
    if (!handleDirtyExport()) {
      return;
    }

    win.webContents.send('main-process-export', {});
  });

  function handleDirty() {
    if (isDirty()) {
      var options = {
        buttons: ['はい', 'いいえ', 'キャンセル'],
        message: '編集されています。保存しますか？'
      };
      var result = dialog.showMessageBox(options);
      switch (result) {
        case 0:
          // save
          if (!global.appInfo.isNewFile) {
            win.webContents.send('main-process-dirty-save', {
              fileName: global.appInfo.openFilePath,
              isClose: false
            });
          } else {
            var focusedWindow = BrowserWindow.getFocusedWindow();
            var options = {
              title: '名前を付けて保存',
              defaultPath: '',
              filters: [{
                name: 'bpmnファイル',
                extensions: ['bpmn']
              }]
            };

            var filePath = dialog.showSaveDialog(focusedWindow, options);
            if (filePath) {
              global.appInfo.openFilePath = filePath;
              global.appInfo.isNewFile = false;
              win.webContents.send('main-process-dirty-save', {
                fileName: filePath,
                isClose: false
              });
            }
          }
          return true;
        case 1:
          // nop
          return true;
        case 2:
          return false;
      }
    }

    return true;
  }

  function handleDirtyExport(){
    if (isDirty()) {
      var options = {
        buttons: ['はい', 'キャンセル'],
        message: '編集されています。保存しますか？'
      };
      var result = dialog.showMessageBox(options);
      switch (result) {
        case 0:
          // save
          if (!global.appInfo.isNewFile) {
            win.webContents.send('main-process-dirty-save', {
              fileName: global.appInfo.openFilePath,
              isClose: false
            });
          } else {
            var focusedWindow = BrowserWindow.getFocusedWindow();
            var options = {
              title: '名前を付けて保存',
              defaultPath: '',
              filters: [{
                name: 'bpmnファイル',
                extensions: ['bpmn']
              }]
            };

            var filePath = dialog.showSaveDialog(focusedWindow, options);
            if (filePath) {
              global.appInfo.openFilePath = filePath;
              global.appInfo.isNewFile = false;
              win.webContents.send('main-process-dirty-save', {
                fileName: filePath,
                isClose: false
              });
            }
          }
          return true;
        case 1:
          return false;
      }
    }

    return true;
  }

};

function getDefaultPath() {
  var defaultPath = global.appInfo.openFilePath || '';
  if (global.appInfo.isNewFile) {
    defaultPath = '';
  }
  return defaultPath;
}

function isDirty() {
  var openData = '';
  var tempData = '';
  if (global.appInfo.openFilePath !== '' && fs.existsSync(global.appInfo.openFilePath)) {
    openData = fs.readFileSync(global.appInfo.openFilePath, 'utf8');
  }
  if (global.appInfo.tempFilePath !== '' && fs.existsSync(global.appInfo.tempFilePath)) {
    tempData = fs.readFileSync(global.appInfo.tempFilePath, 'utf8');
  }
  return (openData !== tempData);
}

module.exports = ApplicationMenu;