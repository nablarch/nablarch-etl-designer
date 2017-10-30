'use strict';

var fs = require('fs');
var edn = require('edn');

var jobStreamerApiUtil = require('./JobStremaerApiUtil');
var configFileUtil = require('./ConfigFileUtil');

function StructureValidation() {
}

StructureValidation.checkStructure = function (bpmnXmlString, successCallback, timeoutCallback, errorCallback) {
  bpmnXmlString = bpmnXmlString.replace('\r', '').replace('\n', '');
  return callCheckStructure([{
    ednKey: 'bpmn',
    ednValue: bpmnXmlString
  }], successCallback, timeoutCallback, errorCallback);
};

function callCheckStructure(args, successCallback, timeoutCallback, errorCallback) {
  var token = jobStreamerApiUtil.callAuthToken([{ednKey: 'user/id', ednValue: 'admin'}, {
    ednKey: 'user/password',
    ednValue: 'password123'
  }]);
  var postData = jobStreamerApiUtil.createPostData(args);
  var ednObj = jobStreamerApiUtil.executeJobStreamerApi('POST', '/test-executions', postData, token);
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
      jobStreamerApiUtil.executeJobStreamerApiAsync('DELETE', '/test-execution/' + stateId, null, token, function () {
      });
      return;
    }

    if (batchStatus === 'batch-status/completed' || logMessage) {
      successCallback(batchStatus, logMessage, logException);
      jobStreamerApiUtil.executeJobStreamerApiAsync('DELETE', '/test-execution/' + stateId, null, token, function () {
      });
    } else {
      setTimeout(function () {
        jobStreamerApiUtil.executeJobStreamerApiAsync('GET', '/test-execution/' + stateId, null, token, executionCallback);
      }, 1000);
    }
  };

  jobStreamerApiUtil.executeJobStreamerApiAsync('GET', '/test-execution/' + stateId, null, token, executionCallback);
}

module.exports = StructureValidation;