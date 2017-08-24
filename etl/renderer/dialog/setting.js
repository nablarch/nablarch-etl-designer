var fs = require('fs');

var electron = window.require('electron');
var ipc = electron.ipcRenderer;
var remote = electron.remote;
var appInfo = remote.getGlobal('appInfo');

var okButton = document.querySelector('#ok');
var cancelButton = document.querySelector('#cancel');
okButton.addEventListener('click', onOkClick);
cancelButton.addEventListener('click', onCancelClick);

var config = {};
var configFileUtil = require('../util/ConfigFileUtil');
var messageUtil = require('../util/MessageUtil');

var tabItems = document.querySelectorAll('.tab-item');

for (var i = 0; i < tabItems.length; i++) {
  tabItems[i].addEventListener('click', onTabClick);
}

function onOkClick() {
  var activeTab =document.querySelector('.active');
  saveActiveTabToConfig(activeTab);

  configFileUtil.saveConfigFile(config);
  window.close()
}

function onCancelClick() {
  window.close()
}

function onTabClick() {
  var activeTab =document.querySelector('.active');
  saveActiveTabToConfig(activeTab);

  activeTab.classList.remove('active');
  this.classList.add('active');

  loadActiveTabFromConfig(this);
}

function saveActiveTabToConfig(activeTab){
  var contents = document.getElementById('textarea').value;
  switch (activeTab.id) {
    case 'bean-tab':
      config.properties.bean = contents.split('\n');
      break;
    case 'entity-tab':
      config.properties.entities = contents.split('\n');
      break;
    case 'error-entity-tab':
      config.properties.errorEntity = contents.split('\n');
      break;
    case 'file-name-tab':
      config.properties.fileName = contents.split('\n');
      break;
  }
}

function loadActiveTabFromConfig(activeTab){
  switch (activeTab.id) {
    case 'bean-tab':
      document.getElementById('textarea').value = config.properties.bean.join('\n');
      break;
    case 'entity-tab':
      document.getElementById('textarea').value = config.properties.entities.join('\n');
      break;
    case 'error-entity-tab':
      document.getElementById('textarea').value = config.properties.errorEntity.join('\n');
      break;
    case 'file-name-tab':
      document.getElementById('textarea').value = config.properties.fileName.join('\n');
      break;
  }
}

function translateMessage(){
  var convertMessage = {
    okButton: 'OK',
    cancelButton: 'Cancel'
  };

  document.title = messageUtil.getMessage('Settings', appInfo.locale);
  for(var key in convertMessage){
    document.getElementById(key).textContent =  messageUtil.getMessage(convertMessage[key], appInfo.locale);
  }
}

window.onload = function(){
  translateMessage();

  config = configFileUtil.loadConfigFile();
  document.getElementById('textarea').value = config.properties.bean.join('\n');
};

window.onerror = function(message, url, line, colno, err) {
  var errData = {
    message: message,
    url: url,
    line: line,
    colno: colno,
    err: err
  };
  ipc.send('main-handle-error', errData);
};