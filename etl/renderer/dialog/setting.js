var fs = require('fs');
var path = require('path');

var electron = window.require('electron');
var ipc = electron.ipcRenderer;
var remote = electron.remote;
var app = remote.app;

var appInfo = remote.getGlobal('appInfo');

var properties = {};
var configFileUtil = require('../util/ConfigFileUtil');
var messageUtil = require('../util/MessageUtil');

var registryFilePath = appInfo.argDev ? app.getAppPath() : path.join(app.getPath('exe'), '../');
configFileUtil.init(registryFilePath, app.getPath('userData'));
messageUtil.setLocale(configFileUtil.getLocale());

var okButton = document.querySelector('#ok');
var cancelButton = document.querySelector('#cancel');
okButton.addEventListener('click', onOkClick);
cancelButton.addEventListener('click', onCancelClick);

var tabItems = document.querySelectorAll('.tab-item');

for (var i = 0; i < tabItems.length; i++) {
  tabItems[i].addEventListener('click', onTabClick);
}

function onOkClick() {
  var activeTab = document.querySelector('.active');
  saveActiveTabToConfig(activeTab);

  configFileUtil.setProperties(properties);
  window.close()
}

function onCancelClick() {
  window.close()
}

function onTabClick() {
  var activeTab = document.querySelector('.active');
  saveActiveTabToConfig(activeTab);

  activeTab.classList.remove('active');
  this.classList.add('active');

  loadActiveTabFromConfig(this);
}

function saveActiveTabToConfig(activeTab) {
  var contents = document.getElementById('textarea').value;
  switch (activeTab.id) {
    case 'bean-tab':
      properties.bean = contents.split('\n');
      break;
    case 'entity-tab':
      properties.entities = contents.split('\n');
      break;
    case 'error-entity-tab':
      properties.errorEntity = contents.split('\n');
      break;
    case 'file-name-tab':
      properties.fileName = contents.split('\n');
      break;
  }
}

function loadActiveTabFromConfig(activeTab) {
  switch (activeTab.id) {
    case 'bean-tab':
      document.getElementById('textarea').value = properties.bean.join('\n');
      break;
    case 'entity-tab':
      document.getElementById('textarea').value = properties.entities.join('\n');
      break;
    case 'error-entity-tab':
      document.getElementById('textarea').value = properties.errorEntity.join('\n');
      break;
    case 'file-name-tab':
      document.getElementById('textarea').value = properties.fileName.join('\n');
      break;
  }
}

function translateMessage() {
  var convertMessage = {
    okButton: 'OK',
    cancelButton: 'Cancel'
  };

  document.title = messageUtil.getMessage('Settings');
  for (var key in convertMessage) {
    document.getElementById(key).textContent = messageUtil.getMessage(convertMessage[key]);
  }
}

window.onload = function () {
  translateMessage();

  properties = configFileUtil.getProperties();
  document.getElementById('textarea').value = properties.bean.join('\n');
};

window.onerror = function (message, url, line, colno, err) {
  var errData = {
    message: message,
    url: url,
    line: line,
    colno: colno,
    err: err
  };
  ipc.send('main-handle-error', errData);
};