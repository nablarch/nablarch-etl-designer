var electron = require('electron');
var dialog = electron.dialog;
var BrowserWindow = electron.BrowserWindow;
var url = require('url');
var path = require('path');

var ApplicationMenu = function (window) {

  this.template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '保存',
          accelerator: 'Ctrl+S',
          click: function (item, focusedWindow) {
            var focusedWindow = BrowserWindow.getFocusedWindow();
            var options = {
              filters: [{
                name: 'bpmnファイル',
                extensions: ['bpmn']
              }]
            };

            dialog.showSaveDialog(focusedWindow, options, function (filename) {
              if (filename) {
                window.webContents.send('main-process-save-file', {
                  filename: filename
                });
              }
            });
          }
        },
        {
          label: '読み込み',
          accelerator: 'Ctrl+O',
          click: function (item, focusedWindow) {
            var focusedWindow = BrowserWindow.getFocusedWindow();
            var options = {
              properties: ['openFile'],
              filters: [{
                name: 'bpmnファイル',
                extensions: ['bpmn']
              }]
            };
            dialog.showOpenDialog(focusedWindow, options, function (file) {
              if (file) {
                window.webContents.send('main-process-load-file', {
                  file: file[0]
                });
              }
            });
          }
        }
      ]
    },
    {
      label: '編集',
      submenu: [
        {
          label: 'コピー',
          accelerator: 'Ctrl+C',
          role: 'copy'
        },
        {
          label: '貼り付け',
          accelerator: 'Ctrl+V',
          role: 'paste'
        },
        {
          label: '削除',
          accelerator: 'Delete'
        },
        {
          type: 'separator'
        },
        {
          label: '元に戻す',
          accelerator: 'Ctrl+Z',
          role: 'undo'
        },
        {
          label: 'やり直し',
          accelerator: 'Ctrl+Y',
          role: 'redo'
        }
      ]
    },
    {
      label: 'ツール',
      submenu: [
        // {
        //   label: 'チェック'
        // },
        // {
        //   label: '変換'
        // },
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
                  parent: window, resizable: false,
                  modal: true, frame: true
                });
            win.setMenu(null);

            win.loadURL(url.format({
              pathname: path.join(__dirname, '../../dist/setting-dialog/setting.html'),
              protocol: 'file:',
              slashes: true
            }))
          }
        }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'バージョン確認'
        }
      ]
    },
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
  ];
};

module.exports = ApplicationMenu;