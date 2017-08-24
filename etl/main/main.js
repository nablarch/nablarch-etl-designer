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
  jobName: ''
};

global.appInfo = appInfo;

var win;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  if (ConfigFileUtil.isDevelop()) {
    win.openDevTools();
  }

  messageUtil.setLocale(ConfigFileUtil.getLocale());

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
  var content = messageUtil.getMessage('Details:') + '\n';
  content += messageUtil.getMessage('File: {0}', [errData.url]) + '\n';
  content += messageUtil.getMessage('Line: {0}', [errData.line]) + '\n';
  content += messageUtil.getMessage('Column: {0}', [errData.colno]) + '\n';

  dialog.showErrorBox(errData.message.replace('Uncaught Error: ', ''), content);
});

function createApplicationMenu() {
  var menuTemplate = [
    {
      label: messageUtil.getMessage('File'),
      submenu: [
        {
          label: messageUtil.getMessage('New File'),
          accelerator: 'Ctrl+N',
          click: function () {
            MenuActions.createNewBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Save...'),
          accelerator: 'Ctrl+S',
          click: function () {
            MenuActions.saveBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Save As...'),
          click: function () {
            MenuActions.saveAsBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Open...'),
          accelerator: 'Ctrl+O',
          click: function () {
            MenuActions.openBpmn(win);
          }
        },
        {
          label: messageUtil.getMessage('Exit'),
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
      label: messageUtil.getMessage('Tool'),
      submenu: [
        {
          label: messageUtil.getMessage('Export ETL files'),
          click: function (item, focusedWindow) {
            MenuActions.exportJobXml(win);
          }
        },
        {
          label: messageUtil.getMessage('Validate...'),
          accelerator: 'Ctrl+T',
          click: function (item, focusedWindow) {
            MenuActions.validation(win);
          }
        },
        {
          label: messageUtil.getMessage('Settings...'),
          accelerator: 'Ctrl+Shift+S',
          click: function () {
            MenuActions.setting(win);
          }
        }
      ]
    },
    {
      label: messageUtil.getMessage('Help '),
      submenu: [
        {
          label: messageUtil.getMessage('About...'),
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
