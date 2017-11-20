var electron = require('electron');
var dialog = electron.dialog;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;
var app = electron.app;

var url = require('url');
var path = require('path');
var fs = require('fs');

var configFileUtil = require('../renderer/util/ConfigFileUtil');
var messageUtil = require('../renderer/util/MessageUtil');

var MenuActions = function(){
};

MenuActions.setBrowserWindow = function(win) {
  this.win = win;
};

MenuActions.createNewBpmn = function() {
  var dirty = handleDirty(messageUtil.getMessage('The data is edited, do you want to save?'));
  if(!dirty) {
    return;
  }
  importBpmn();
};

MenuActions.saveBpmn = function() {
  if(appInfo.openFilePath){
    doSaveBpmnFile();
  }else{
    doSaveAsBpmnFile();
  }
};

function doSaveBpmnFile() {
  var filePath = appInfo.openFilePath;
  return doSaveBpmn(filePath);
}

MenuActions.saveAsBpmn = function() {
  doSaveAsBpmnFile();
};

function doSaveAsBpmnFile() {
  var filePath = showSaveBpmnFileDialog();
  if(!filePath) {
    return false;
  }
  return doSaveBpmn(filePath);
}

function doSaveBpmn(filePath) {
  var bpmnString = appInfo.workBpmnString;
  try{
    writeFileAppendAppVersion(filePath, bpmnString);
    appInfo.openFilePath = filePath;
    MenuActions.win.setTitle(messageUtil.getMessage('ETL Designer - [{0}]', [filePath]));
    return true;
  }catch(e){
    showErrorDialog(
        messageUtil.getMessage('Failed to save a bpmn file.'),
        messageUtil.getMessage('Path: {0}', [filePath]),
        e.message);
    return false;
  }
}

MenuActions.openBpmn = function() {
  var dirty = handleDirty(messageUtil.getMessage('The data is edited, do you want to save?'));
  if(!dirty) {
    return;
  }
  var filePaths = showOpenBpmnFileDialog();
  if(!filePaths) {
    return;
  }
  try{
    var bpmnString = readFileRemoveAppVersion(filePaths[0],'utf8');
  }catch(e){
    showErrorDialog(
        messageUtil.getMessage('Failed to load a bpmn file.'),
        messageUtil.getMessage('Path: {0}', [filePaths[0]]),
        e.message);
  }
  importBpmn(bpmnString, filePaths[0]);
};

function importBpmn(bpmnString, filepath) {
  MenuActions.win.webContents.send('main-process-import-bpmn-file', {
        bpmnString: bpmnString,
        filepath: filepath
      }
  );
}

function showOpenBpmnFileDialog(){
  var focusedWindow = BrowserWindow.getFocusedWindow();
  var options = {
    title: messageUtil.getMessage('Open'),
    properties: ['openFile'],
    filters: [{
      name: messageUtil.getMessage('bpmn file.'),
      extensions: ['bpmn']
    }]
  };
  return dialog.showOpenDialog(focusedWindow, options);
}

function showSaveBpmnFileDialog(){
  var focusedWindow = BrowserWindow.getFocusedWindow();
  var options = {
    title: messageUtil.getMessage('Save as'),
    defaultPath: appInfo.openFilePath,
    filters: [{
      name: messageUtil.getMessage('bpmn file.'),
      extensions: ['bpmn']
    }]
  };

  var filePath = dialog.showSaveDialog(focusedWindow, options);
  return filePath;
}

function showSaveXmlFileDialog(){
  var baseName = appInfo.jobName + '.xml';
  var dirName = path.dirname(appInfo.openFilePath);
  var basePath = path.join(dirName, baseName);

  var focusedWindow = BrowserWindow.getFocusedWindow();
  var options = {
    title: messageUtil.getMessage('Save as'),
    defaultPath: basePath,
    filters: [{
      name: messageUtil.getMessage('xml file.'),
      extensions: ['xml']
    }]
  };

  return dialog.showSaveDialog(focusedWindow, options);
}

MenuActions.canCloseWindow = function(){
  return handleDirty(messageUtil.getMessage('The data is edited, do you want to save and quit?'));
};

MenuActions.exportJobXml = function(){
  this.win.webContents.send('main-process-pre-export-etl-files');
};

ipc.on('renderer-process-checked-job-name', function(event, args){
  if(args.message){
    dialog.showMessageBox({
      message: args.message
    });
    return;
  }

  var filePath = showSaveXmlFileDialog();
  if(!filePath){
    return;
  }

  var baseName = path.basename(filePath,'.xml');
  var dirName = path.dirname(filePath);
  var basePath = path.join(dirName, baseName);

  event.sender.send('main-process-export-etl-files', {
    xmlPath: basePath + '.xml',
    jsonPath: basePath + '.json'
  });
});

var validationDialogWindow;
MenuActions.validation = function(){

  if(validationDialogWindow){
    validationDialogWindow.focus();
    validationDialogWindow.flashFrame(true);
    return;
  }

  validationDialogWindow = new BrowserWindow(
      {
        width: 800, height: 500,
        parent: MenuActions.win, resizable: true,
        modal: false, frame: true

      });
  validationDialogWindow.setMenu(null);
  if(configFileUtil.isDevelop()){
    validationDialogWindow.openDevTools();
  }

  validationDialogWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/dialog/validation.html'),
    protocol: 'file:',
    slashes: true
  }));

  validationDialogWindow.on('closed', function () {
    validationDialogWindow = null;
  });
};

MenuActions.setting = function(){
  var dialogWindow = new BrowserWindow(
      {
        width: 400, height: 500,
        parent: MenuActions.win, resizable: false,
        modal: true, frame: true
      });
  dialogWindow.setMenu(null);
  if(configFileUtil.isDevelop()){
    dialogWindow.openDevTools();
  }

  dialogWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/dialog/setting.html'),
    protocol: 'file:',
    slashes: true
  }));
};

MenuActions.checkVersion = function(){
  var detail = '\n' + messageUtil.getMessage('Version {0}', [app.getVersion()]);

  var options = {
    type: 'info',
    title: messageUtil.getMessage('Version Information'),
    message: messageUtil.getMessage('ETL Designer'),
    detail: detail
  };
  dialog.showMessageBox(options);
};

function showErrorDialog(title, message, option){
  title = title || messageUtil.getMessage('Error');
  var content = message || messageUtil.getMessage('An unexpected error occurred.');
  if(option) {
    content += '\n' + option;
  }

  dialog.showErrorBox(title, content);
}

function isDirty() {
  var openData = require('../resources/initDiagram.js');

  if (global.appInfo.openFilePath !== '' && fs.existsSync(global.appInfo.openFilePath)) {
    try{
      openData = readFileRemoveAppVersion(global.appInfo.openFilePath);
    }catch(e){
      showErrorDialog(
          messageUtil.getMessage('Failed to load a bpmn file.'),
          messageUtil.getMessage('Path: {0}', [global.appInfo.openFilePath]),
          e.message);
    }
  }

  var tempData = appInfo.workBpmnString;
  return (openData !== tempData);
}

function handleDirty(message) {
  if (isDirty()) {
    var options = {
      buttons: [
        messageUtil.getMessage('Yes'),
        messageUtil.getMessage('No'),
        messageUtil.getMessage('Cancel')
      ],
      message: message,
      cancelId: 2
    };
    var result = dialog.showMessageBox(options);
    switch (result) {
      case 0:
        // save
        if (appInfo.openFilePath) {
          return doSaveBpmnFile();
        } else {
          return doSaveAsBpmnFile();
        }
      case 1:
        // nop
        return true;
      case 2:
        return false;
    }
  }

  return true;
}

function appendAppVersion(bpmnString) {
  var strArray = bpmnString.split(/\r\n|\r|\n/);
  var versionLabel = '<!-- etl designer version ' + app.getVersion()  + ' -->';
  if(strArray.length > 1 && strArray[1].indexOf('etl designer version') === -1){
    strArray.splice(1, 0, versionLabel);
  }
  return strArray.join('\n');
}

function removeAppVersion(bpmnString){
  var strArray = bpmnString.split(/\r\n|\r|\n/);
  if(strArray.length > 1 && strArray[1].indexOf('etl designer version') !== -1){
    strArray.splice(1,1);
  }
  return strArray.join('\n');
}

function writeFileAppendAppVersion(filePath, bpmnString) {
  fs.writeFileSync(filePath, appendAppVersion(bpmnString), 'utf8');
}

function readFileRemoveAppVersion(filePath){
  return removeAppVersion(fs.readFileSync(filePath, 'utf8'));
}

module.exports = MenuActions;