var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var dialog = electron.dialog;
var ipc = electron.ipcMain;

var path = require('path');
var url = require('url');
var fs = require('fs');

var Menu = electron.Menu;

var MenuActions = require('./MenuActions');
var ConfigFileUtil = require('../renderer/util/ConfigFileUtil');
var messageUtil = require('../renderer/util/MessageUtil');

var appInfo = {
  openFilePath: '',
  workBpmnString: '',
  jobName: '',
  locale: ''
};

global.appInfo = appInfo;

var win;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  if (ConfigFileUtil.isDevelop()) {
    win.openDevTools();
  }

  appInfo.locale = ConfigFileUtil.getLocale();

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

ipc.on('main-handle-error', function(event, errData){
  var content = messageUtil.getMessage('Details:', appInfo.locale) + '\n';
  content += messageUtil.getMessage('File: {0}', appInfo.locale, [errData.url]) + '\n';
  content += messageUtil.getMessage('Line: {0}', appInfo.locale, [errData.line]) + '\n';
  content += messageUtil.getMessage('Column: {0}', appInfo.locale, [errData.colno]) + '\n';

  dialog.showErrorBox(errData.message.replace('Uncaught Error: ', ''), content);
});

function createApplicationMenu() {
  var menuTemplate = [
    {
      label: messageUtil.getMessage('File', appInfo.locale),
      submenu: [
        {
          label: messageUtil.getMessage('New File', appInfo.locale),
          accelerator: 'Ctrl+N',
          click: function () {
            MenuActions.createNewBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Save...', appInfo.locale),
          accelerator: 'Ctrl+S',
          click: function () {
            MenuActions.saveBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Save As...', appInfo.locale),
          click: function () {
            MenuActions.saveAsBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Open...', appInfo.locale),
          accelerator: 'Ctrl+O',
          click: function () {
            MenuActions.openBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Exit', appInfo.locale),
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
      label: messageUtil.getMessage('Tool', appInfo.locale),
      submenu: [
        {
          label: messageUtil.getMessage('Export ETL files', appInfo.locale),
          click: function (item, focusedWindow) {
            MenuActions.exportJobXml(win);
          }
        },
        {
          label: messageUtil.getMessage('Validate...', appInfo.locale),
          accelerator: 'Ctrl+T',
          click: function (item, focusedWindow) {
            MenuActions.validation(win);
          }
        },
        {
          label: messageUtil.getMessage('Settings...', appInfo.locale),
          accelerator: 'Ctrl+Shift+S',
          click: function () {
            MenuActions.setting(win);
          }
        }
      ]
    },
    {
      label: messageUtil.getMessage('Help ', appInfo.locale),
      submenu: [
        {
          label: messageUtil.getMessage('About...', appInfo.locale),
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
