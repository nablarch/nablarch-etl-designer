var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var path = require('path');
var url = require('url');

var parentWindow;
var dialogWindow;

function PropertySettingDialog (win) {
  parentWindow = win;

  this.openDialog = function(item, forcusedWindow){

    if(dialogWindow){
      return;
    }

    dialogWindow = new BrowserWindow({
      width: 800,
      height: 600,
      parent: parentWindow,
      modal: true
    });

    dialogWindow.setMenu(null);
    dialogWindow.openDevTools();

    dialogWindow.loadURL(url.format({
      pathname: path.join(__dirname, '../../dist/settingDialog.html'),
      protocol: 'file:',
      slashes: true
    }));

    dialogWindow.on('closed', function () {
      dialogWindow = null;
    });

  };
}

module.exports = PropertySettingDialog;