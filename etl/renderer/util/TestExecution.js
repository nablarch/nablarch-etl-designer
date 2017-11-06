'use strict';

var fs = require('fs');
var edn = require('edn');

var jobStreamerApiUtil = require('./JobStremaerApiUtil');
var configFileUtil = require('./ConfigFileUtil');

function TestExecution() {
}

TestExecution.execute = function (bpmnXmlString, successCallback, timeoutCallback, errorCallback) {
  bpmnXmlString = bpmnXmlString.replace('\r', '').replace('\n', '');
  return callExecute([{
    ednKey: 'bpmn',
    ednValue: bpmnXmlString
  }], successCallback, timeoutCallback, errorCallback);
};

function callExecute(args, successCallback, timeoutCallback, errorCallback) {
  var token = jobStreamerApiUtil.callAuthToken();
  var postData = jobStreamerApiUtil.createPostData(args);
  var ednObj = jobStreamerApiUtil.executeJobStreamerApi('POST', '/test-executions', postData, token, false);
  var stateId = jobStreamerApiUtil.getValueFromEdnObject(ednObj, 'state-id');

  var batchStatus = '';
  var logMessage = '';
  var logException = '';
  var callCheckApiCount = 0;
  var timeOutCount = configFileUtil.getJobStreamerInfo().timeoutCount || 20;

  var executionCallback = function (xhr) {
    var responseText = xhr.responseText;

    batchStatus = jobStreamerApiUtil.getValueFromEdnObject(responseText, 'batch-status');
    logMessage = jobStreamerApiUtil.getValueFromEdnObject(responseText, 'log-message');
    logException = jobStreamerApiUtil.getValueFromEdnObject(responseText, 'log-exception');
    callCheckApiCount++;

    if (callCheckApiCount > timeOutCount) {
      timeoutCallback();
      jobStreamerApiUtil.executeJobStreamerApi('DELETE', '/test-execution/' + stateId, null, token, true, function () {
      });
      return;
    }

    if (batchStatus === 'batch-status/completed' || logMessage) {
      successCallback(batchStatus, logMessage, logException);
      jobStreamerApiUtil.executeJobStreamerApi('DELETE', '/test-execution/' + stateId, null, token, true, function () {
      });
    } else {
      setTimeout(function () {
        jobStreamerApiUtil.executeJobStreamerApi('GET', '/test-execution/' + stateId, null, token, true, executionCallback);
      }, 1000);
    }
  };

  jobStreamerApiUtil.executeJobStreamerApi('GET', '/test-execution/' + stateId, null, token, true, executionCallback);
}

module.exports = TestExecution;