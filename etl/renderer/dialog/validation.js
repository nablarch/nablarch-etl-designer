var path = require('path');

var electron = window.require('electron');
var ipc = electron.ipcRenderer;
var remote = electron.remote;
var app = remote.app;

var appInfo = remote.getGlobal('appInfo');

var etlDesignerCheck = require('../util/EtlDesignerChecker');
var configFileUtil = require('../util/ConfigFileUtil');
var messageUtil = require('../util/MessageUtil');
var structureValidation = require('../util/StructureValidation');

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

var successCallback = function (batchStatus, logMessage, logException) {
  if (logMessage) {
    validationResult.structureMessage = formatErrorMessage(logMessage, logException);
  } else {
    validationResult.structureMessage = messageUtil.getMessage('No error is detected.');
  }

  var activeTab = document.querySelector('.active');
  loadActiveTab(activeTab);
};

var timeoutCallback = function () {
  validationResult.structureMessage = messageUtil.getMessage('Access time out.');

  var activeTab = document.querySelector('.active');
  loadActiveTab(activeTab);
};

function formatErrorMessage(logMessage, logException) {
  var message = messageUtil.getMessage('Job structure has error.') + '\n';
  message += logMessage + '\n';
  message += logException.split('\r\n')[0] + '\n';

  return message;
}

function onCheckClick() {
  var bpmnXmlString = appInfo.workBpmnString;
  var result = etlDesignerCheck.check(bpmnXmlString);
  structureValidation.checkStructure(appInfo.workBpmnString, successCallback, timeoutCallback);
  validationResult.structureMessage = messageUtil.getMessage('Checking...');
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
  var contents = document.getElementById('result-area').innerText;
  switch (activeTab.id) {
    case 'error-tab':
      validationResult.errorMessage = contents;
      break;
    case 'warning-tab':
      validationResult.warningMessage = contents;
      break;
    case 'structure-tab':
      validationResult.structureMessage = contents;
      break;
  }
}

function loadActiveTab(activeTab) {
  switch (activeTab.id) {
    case 'error-tab':
      document.getElementById('result-area').innerText = validationResult.errorMessage;
      break;
    case 'warning-tab':
      document.getElementById('result-area').innerText = validationResult.warningMessage;
      break;
    case 'structure-tab':
      document.getElementById('result-area').innerText = validationResult.structureMessage;
      break;
  }
}

function translateMessage() {
  var convertMessage = {
    errorTab: 'Error',
    warningTab: 'Warning',
    structureTab: 'Job structure check',
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
  structureValidation.checkStructure(appInfo.workBpmnString, successCallback, timeoutCallback);
  validationResult.structureMessage = messageUtil.getMessage('Checking...');
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