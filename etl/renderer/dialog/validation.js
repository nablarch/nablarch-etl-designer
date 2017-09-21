var path = require('path');

var electron = window.require('electron');
var ipc = electron.ipcRenderer;
var remote = electron.remote;
var app = remote.app;

var appInfo = remote.getGlobal('appInfo');

var etlDesignerCheck = require('../util/EtlDesignerChecker');
var configFileUtil = require('../util/ConfigFileUtil');
var messageUtil = require('../util/MessageUtil');

var registryFilePath = appInfo.argDev ? app.getAppPath() : path.join(app.getPath('exe'), '../');
configFileUtil.init(registryFilePath, app.getPath('userData'));
messageUtil.setLocale(configFileUtil.getLocale());

var checkButton = document.querySelector('#check');
var cancelButton = document.querySelector('#cancel');
checkButton.addEventListener('click', onCheckClick);
cancelButton.addEventListener('click', onCancelClick);

var tabItems = document.querySelectorAll('.tab-item');

var validationResult = {};

for (var i = 0; i < tabItems.length; i++) {
  tabItems[i].addEventListener('click', onTabClick);
}

function onCheckClick() {
  var bpmnXmlString = appInfo.workBpmnString;
  var result = etlDesignerCheck.check(bpmnXmlString);
  validationResult.errorMessage = (result.errors.length === 0) ? messageUtil.getMessage('No error is detected.') : result.errors.join('\n');
  validationResult.warningMessage = (result.warnings.length === 0) ? messageUtil.getMessage('No warning is detected.') : result.warnings.join('\n');
  loadActiveTab(document.querySelector('.active'));
}

function onCancelClick() {
  window.close();
}

function onTabClick() {
  var activeTab = document.querySelector('.active');
  saveActiveTab(activeTab);

  activeTab.classList.remove('active');
  this.classList.add('active');

  loadActiveTab(this);
}

function saveActiveTab(activeTab) {
  var contents = document.getElementById('textarea').value;
  switch (activeTab.id) {
    case 'error-tab':
      validationResult.errorMessage = contents;
      break;
    case 'warning-tab':
      validationResult.warningMessage = contents;
      break;
  }
}

function loadActiveTab(activeTab) {
  switch (activeTab.id) {
    case 'error-tab':
      document.getElementById('textarea').value = validationResult.errorMessage;
      break;
    case 'warning-tab':
      document.getElementById('textarea').value = validationResult.warningMessage;
      break;
  }
}

function translateMessage() {
  var convertMessage = {
    errorTab: 'Error',
    warningTab: 'Warning',
    checkButton: 'Check',
    closeButton: 'Close'
  };

  document.title = messageUtil.getMessage('Validation');
  for (var key in convertMessage) {
    document.getElementById(key).textContent = messageUtil.getMessage(convertMessage[key]);
  }
}

window.onload = function () {
  translateMessage();

  var bpmnXmlString = appInfo.workBpmnString;
  var result = etlDesignerCheck.check(bpmnXmlString);
  validationResult.errorMessage = (result.errors.length === 0) ? messageUtil.getMessage('No error is detected.') : result.errors.join('\n');
  validationResult.warningMessage = (result.warnings.length === 0) ? messageUtil.getMessage('No warning is detected.') : result.warnings.join('\n');
  loadActiveTab(document.querySelector('.active'));
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