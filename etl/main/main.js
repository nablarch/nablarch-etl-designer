var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var dialog = electron.dialog;
var ipc = electron.ipcMain;

var path = require('path');
var url = require('url');
var fs = require('fs');

var Menu = electron.Menu;

process.on('uncaughtException', function (err) {
  dialog.showErrorBox(err.message, ' ');
});

ipc.on('main-handle-error', function (event, errData) {
  var content = messageUtil.getMessage('Details:') + '\n';
  content += messageUtil.getMessage('File: {0}', [errData.url]) + '\n';
  content += messageUtil.getMessage('Line: {0}', [errData.line]) + '\n';
  content += messageUtil.getMessage('Column: {0}', [errData.col]) + '\n';

  dialog.showErrorBox(errData.message.replace('Uncaught Error: ', ''), content);
});

var MenuActions = require('./MenuActions');
var configFileUtil = require('../renderer/util/ConfigFileUtil');
var messageUtil = require('../renderer/util/MessageUtil');

var appInfo = {
  openFilePath: '',
  workBpmnString: '',
  originalBpmnString: '',
  jobName: ''
};
appInfo.argDev = process.argv.indexOf('--dev') >= 0;
global.appInfo = appInfo;

var win;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600, icon: path.join(__dirname, '../resources/jobedit.ico')});

  var registryFilePath = appInfo.argDev ? app.getAppPath() : path.join(app.getPath('exe'), '../');
  configFileUtil.init(registryFilePath, app.getPath('userData'));
  if (configFileUtil.isDevelop()) {
    win.openDevTools();
  }

  messageUtil.setLocale(configFileUtil.getLocale());

  createApplicationMenu();

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('close', function (event) {
    if (!MenuActions.canCloseWindow()) {
      event.preventDefault();
    }
  });

  win.on('closed', function () {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
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
  MenuActions.setBrowserWindow(win);
  var menuTemplate = [
    {
      label: messageUtil.getMessage('File'),
      submenu: [
        {
          label: messageUtil.getMessage('New File'),
          accelerator: 'Ctrl+N',
          click: function () {
            MenuActions.createNewBpmn();
          }
        },
        {
          label: messageUtil.getMessage('Save...'),
          accelerator: 'Ctrl+S',
          click: function () {
            MenuActions.saveBpmn();
          }
        },
        {
          label: messageUtil.getMessage('Save As...'),
          click: function () {
            MenuActions.saveAsBpmn();
          }
        },
        {
          label: messageUtil.getMessage('Open...'),
          accelerator: 'Ctrl+O',
          click: function () {
            MenuActions.openBpmn();
          }
        },
        {
          label: messageUtil.getMessage('Exit'),
          click: function () {
            win = null;
            if (process.platform !== 'darwin') {
              app.quit();
            }
          }
        }
      ]
    },
    {
      label: messageUtil.getMessage('Tool'),
      submenu: [
        {
          label: messageUtil.getMessage('Export ETL files'),
          click: function () {
            MenuActions.exportJobXml();
          }
        },
        {
          label: messageUtil.getMessage('Validate...'),
          accelerator: 'Ctrl+T',
          click: function () {
            MenuActions.validation();
          }
        },
        {
          label: messageUtil.getMessage('Settings...'),
          accelerator: 'Ctrl+Shift+S',
          click: function () {
            MenuActions.setting();
          }
        }
      ]
    },
    {
      label: messageUtil.getMessage('Help '),
      submenu: [
        {
          label: messageUtil.getMessage('About...'),
          click: function () {
            MenuActions.checkVersion();
          }
        }
      ]
    }
  ];

  if (configFileUtil.isDevelop()) {
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
