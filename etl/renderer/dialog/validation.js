var path = require('path');

var electron = window.require('electron');
var ipc = electron.ipcRenderer;
var remote = electron.remote;
var app = remote.app;

var appInfo = remote.getGlobal('appInfo');

var etlDesignerCheck = require('../util/EtlDesignerChecker');
var configFileUtil = require('../util/ConfigFileUtil');
var messageUtil = require('../util/MessageUtil');
var testExecution = require('../util/TestExecution');

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
  var message = messageUtil.getMessage('The following error occurred during test execution.') + '\n\n';
  message += 'Stack trace:\n';
  message += logMessage + '\n';
  message += logException;

  return message;
}

function onCheckClick() {
  var bpmnXmlString = appInfo.workBpmnString;
  var result = etlDesignerCheck.check(bpmnXmlString);
  testExecution.execute(appInfo.workBpmnString, successCallback, timeoutCallback);
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
  var contents = document.getElementById('result-area').value;
  switch (activeTab.id) {
    case 'error-tab':
      validationResult.errorMessage = contents;
      break;
    case 'warning-tab':
      validationResult.warningMessage = contents;
      break;
    case 'test-tab':
      validationResult.structureMessage = contents;
      break;
  }
}

function loadActiveTab(activeTab) {
  switch (activeTab.id) {
    case 'error-tab':
      document.getElementById('result-area').value = validationResult.errorMessage;
      break;
    case 'warning-tab':
      document.getElementById('result-area').value = validationResult.warningMessage;
      break;
    case 'test-tab':
      document.getElementById('result-area').value = validationResult.structureMessage;
      break;
  }
}

function translateMessage() {
  var convertMessage = {
    errorTab: 'Error',
    warningTab: 'Warning',
    testTab: 'Test result',
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
  testExecution.execute(appInfo.workBpmnString, successCallback, timeoutCallback);
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