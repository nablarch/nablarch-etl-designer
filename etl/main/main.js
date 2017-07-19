var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var path = require('path');
var url = require('url');

var Menu = electron.Menu;

var ApplicationMenu = require('./ApplicationMenu');


var win;

function createWindow() {
  win = new BrowserWindow({width: 1600, height: 1200});
  win.openDevTools();

  createApplicationMenu(win);

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));

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