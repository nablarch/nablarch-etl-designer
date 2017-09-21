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

MenuActions.createNewBpmn = function(win) {
  var dirty = handleDirty(win,messageUtil.getMessage('The data is edited, do you want to save?'));
  if(!dirty) {
    return;
  }
  appInfo.openFilePath = '';
  importBpmn(win);
};

MenuActions.saveBpmn = function(win) {
  if(appInfo.openFilePath){
    doSaveBpmnFile(win);
  }else{
    doSaveAsBpmnFile(win);
  }
};

function doSaveBpmnFile() {
  var filePath = appInfo.openFilePath;
  return doSaveBpmn(filePath);
}

MenuActions.saveAsBpmn = function(win) {
  doSaveAsBpmnFile(win);
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
    return true;
  }catch(e){
    showErrorDialog(
        messageUtil.getMessage('Failed to save a bpmn file.'),
        messageUtil.getMessage('Path: {0}', [filePath]),
        e.message);
    return false;
  }
}

MenuActions.openBpmn = function(win) {
  var dirty = handleDirty(win, messageUtil.getMessage('The data is edited, do you want to save?'));
  if(!dirty) {
    return;
  }
  var filePaths = showOpenBpmnFileDialog();
  if(!filePaths) {
    return;
  }
  global.appInfo.openFilePath = filePaths[0];
  try{
    var bpmnString = readFileRemoveAppVersion(filePaths[0],'utf8');
  }catch(e){
    showErrorDialog(
        messageUtil.getMessage('Failed to load a bpmn file.'),
        messageUtil.getMessage('Path: {0}', [filePaths[0]]),
        e.message);
  }
  importBpmn(win, bpmnString);
};

function importBpmn(win, bpmnString) {
  win.webContents.send('main-process-import-bpmn-file',
      {bpmnString: bpmnString});
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
  if (filePath) {
    appInfo.openFilePath = filePath;
  }
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

MenuActions.canCloseWindow = function(win){
  return handleDirty(win, messageUtil.getMessage('The data is edited, do you want to save and quit?'));
};

MenuActions.exportJobXml = function(win){
  win.webContents.send('main-process-pre-export-etl-files');
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

MenuActions.validation = function(win){
  var dialogWindow = new BrowserWindow(
      {
        width: 800, height: 500,
        parent: win, resizable: true,
        modal: false, frame: true

      });
  dialogWindow.setMenu(null);
  if(configFileUtil.isDevelop()){
    dialogWindow.openDevTools();
  }

  dialogWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/dialog/validation.html'),
    protocol: 'file:',
    slashes: true
  }));
};

MenuActions.setting = function(win){
  var dialogWindow = new BrowserWindow(
      {
        width: 400, height: 500,
        parent: win, resizable: configFileUtil.isDevelop(),
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
  var openData =
'<?xml version="1.0" encoding="UTF-8"?>\n\
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:jsr352="http://jsr352/" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n\
  <jsr352:job id="Job_1" isExecutable="false">\n\
    <jsr352:start id="Start_1" />\n\
  </jsr352:job>\n\
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n\
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Job_1">\n\
      <bpmndi:BPMNShape id="_BPMNShape_Start_2" bpmnElement="Start_1">\n\
        <dc:Bounds x="173" y="102" width="36" height="36" />\n\
      </bpmndi:BPMNShape>\n\
    </bpmndi:BPMNPlane>\n\
  </bpmndi:BPMNDiagram>\n\
</bpmn:definitions>\n';

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

function handleDirty(win, message) {
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
          return doSaveBpmnFile(win);
        } else {
          return doSaveAsBpmnFile(win);
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