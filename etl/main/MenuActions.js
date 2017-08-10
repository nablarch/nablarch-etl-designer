var electron = require('electron');
var dialog = electron.dialog;
var BrowserWindow = electron.BrowserWindow;

var url = require('url');
var path = require('path');
var fs = require('fs');

var ConfigFileUtil = require('../renderer/util/ConfigFileUtil');

var MenuActions = function(){
};

MenuActions.createNewBpmn = function(win) {
  var options = {
    buttons: ['はい', 'いいえ', 'キャンセル'],
    message: '編集されています。保存しますか？'
  };
  var dirty = handleDirty(win, options);
  if(!dirty) {
    return;
  }
  appInfo.openFilePath = '';
  importBpmn(win);
};

MenuActions.saveBpmn = function(win) {
  doSaveBpmnFile(win);
};

function doSaveBpmnFile() {
  var filePath = appInfo.openFilePath;
  var bpmnString = appInfo.workBpmnString;
  fs.writeFileSync(filePath, bpmnString, 'utf8');
}

MenuActions.saveAsBpmn = function(win) {
  if(!appInfo.openFilePath){
    doSaveAsBpmnFile(win);
  }else{
    doSaveBpmnFile(win);
  }
};

function doSaveAsBpmnFile() {
  var filePath = showSaveBpmnFileDialog();
  if(!filePath) {
    return;
  }
  var bpmnString = appInfo.workBpmnString;
  fs.writeFileSync(filePath, bpmnString, 'utf8');
}

MenuActions.openBpmn = function(win) {
  var options = {
    buttons: ['はい', 'いいえ', 'キャンセル'],
    message: '編集されています。保存しますか？'
  };
  var dirty = handleDirty(win, options);
  if(!dirty) {
    return;
  }
  var filePaths = showOpenBpmnFileDialog();
  if(!filePaths) {
    return;
  }
  global.appInfo.openFilePath = filePaths[0];
  var bpmnString = fs.readFileSync(filePaths[0],'utf8');
  importBpmn(win, bpmnString);
};

function importBpmn(win, bpmnString) {
  win.webContents.send('main-process-import-bpmn-file',
      {bpmnString: bpmnString});
}

function showOpenBpmnFileDialog(){
  var focusedWindow = BrowserWindow.getFocusedWindow();
  var options = {
    properties: ['openFile'],
    filters: [{
      name: 'bpmnファイル',
      extensions: ['bpmn']
    }]
  };
  var filePaths = dialog.showOpenDialog(focusedWindow, options);
  return filePaths;
}

function showSaveBpmnFileDialog(){
  var focusedWindow = BrowserWindow.getFocusedWindow();
  var options = {
    title: '名前を付けて保存',
    defaultPath: appInfo.openFilePath,
    filters: [{
      name: 'bpmnファイル',
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
  var focusedWindow = BrowserWindow.getFocusedWindow();
  var options = {
    title: '名前を付けて保存',
    // defaultPath: ,
    filters: [{
      name: 'xmlファイル',
      extensions: ['xml']
    }]
  };

  return dialog.showSaveDialog(focusedWindow, options);
}

MenuActions.canCloseWindow = function(win){
  var options = {
    buttons: ['はい', 'いいえ', 'キャンセル'],
    message: '編集されています。保存して終了しますか？'
  };
  return handleDirty(win, options);
};

MenuActions.exportJobXml = function(win){
  var filePath = showSaveXmlFileDialog();
  if(!filePath){
    return;
  }

  var baseName = path.basename(filePath,'.xml');
  var dirName = path.dirname(filePath);
  var basePath = path.join(dirName, baseName);

  win.webContents.send('main-process-export-etl-files', {
    xmlPath: basePath + '.xml',
    jsonPath: basePath + '.json'
  });
};

MenuActions.validation = function(win){
  var dialogWindow = new BrowserWindow(
      {
        width: 800, height: 500,
        parent: win, resizable: true,
        modal: false, frame: true

      });
  dialogWindow.setMenu(null);
  if(ConfigFileUtil.isDevelop()){
    dialogWindow.openDevTools();
  }

  dialogWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../../dist/setting-dialog/validation.html'),
    protocol: 'file:',
    slashes: true
  }));
};

function isDirty() {
  var openData = '<?xml version="1.0" encoding="UTF-8"?>\n\
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
    openData = fs.readFileSync(global.appInfo.openFilePath, 'utf8');
  }

  var tempData = appInfo.workBpmnString;
  return (openData !== tempData);
}

function handleDirty(win, options) {
  if (isDirty()) {
    var result = dialog.showMessageBox(options);
    switch (result) {
      case 0:
        // save
        if (appInfo.openFilePath) {
          doSaveBpmnFile(win);
        } else {
          doSaveAsBpmnFile(win);
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

module.exports = MenuActions;