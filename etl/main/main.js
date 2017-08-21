var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var dialog = electron.dialog;

var path = require('path');
var url = require('url');
var fs = require('fs');

var Menu = electron.Menu;

var MenuActions = require('./MenuActions');
var ConfigFileUtil = require('../renderer/util/ConfigFileUtil');

var appInfo = {
  openFilePath: '',
  workBpmnString: '',
  jobName: ''
};

global.appInfo = appInfo;

var win;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  if (ConfigFileUtil.isDevelop()) {
    win.openDevTools();
  }

  createApplicationMenu();

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('close', function (event) {
    if(!MenuActions.canCloseWindow(win)){
      event.preventDefault();
    }
  });

  win.on('closed', function () {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function (event) {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (win === null) {
    createWindow();
  }
});

function createApplicationMenu() {
  var menuTemplate = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新規作成',
          accelerator: 'Ctrl+N',
          click: function () {
            MenuActions.createNewBpmn(win);
          }
        },
        {
          label: '上書き保存',
          accelerator: 'Ctrl+S',
          click: function () {
            MenuActions.saveBpmn(win);
          }
        },
        {
          label: '名前を付けて保存',
          click: function () {
            MenuActions.saveAsBpmn(win);
          }
        },
        {
          label: '開く',
          accelerator: 'Ctrl+O',
          click: function () {
            MenuActions.openBpmn(win);
          }
        },
        {
          label: '終了',
          click: function(item, focusedWindow) {
            if(MenuActions.canCloseWindow(win)){
              win = null;
              if (process.platform !== 'darwin') {
                app.quit();
              }
            }
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
            MenuActions.exportJobXml(win);
          }
        },
        {
          label: 'バリデーション',
          accelerator: 'Ctrl+T',
          click: function (item, focusedWindow) {
            MenuActions.validation(win);
          }
        },
        {
          label: '設定',
          accelerator: 'Ctrl+Shift+S',
          click: function () {
            MenuActions.setting(win);
          }
        }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'バージョン情報',
          click: function() {
            MenuActions.checkVersion(win);
          }
        }
      ]
    }
  ];

  if (ConfigFileUtil.isDevelop()) {
    menuTemplate.push(
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

  var menu = Menu.buildFromTemplate(menuTemplate);
  win.setMenu(menu);
}
