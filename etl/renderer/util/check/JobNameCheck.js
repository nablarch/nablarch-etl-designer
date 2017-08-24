'use strict';

var checkUtil = require('../CheckUtil');

var electron = window.require('electron');
var remote = electron.remote;

var appInfo = remote.getGlobal('appInfo');
var messageUtil = require('../MessageUtil');

function jobNameCheck(bpmnDom){
  var validationResult = [];

  if(!bpmnDom){
    var bpmnXmlString = appInfo.workBpmnString;
    var parser = new DOMParser();
    bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");
  }

  var jobElements = bpmnDom.getElementsByTagName('job');

  var jobName = jobElements[0].getAttribute('bpmn:name');

  if(!jobName){
    validationResult.push(checkUtil.createValidationInfo(
        jobElements[0],
        messageUtil.getMessage('Job [Name] must be set.', appInfo.locale),
        checkUtil.errorTypes.error
    ));
  }else{
    appInfo.jobName = jobName;
  }

  return validationResult;
}

module.exports = jobNameCheck;