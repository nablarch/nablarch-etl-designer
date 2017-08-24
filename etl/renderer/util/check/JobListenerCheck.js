'use strict';

var checkUtil = require('../CheckUtil');

var electron = window.require('electron');
var remote = electron.remote;

var appInfo = remote.getGlobal('appInfo');
var messageUtil = require('../MessageUtil');

function jobListenerCheck(bpmnDom){
  var validationResult = [];
  var jobElement = bpmnDom.getElementsByTagName('job')[0];
  var jobChildNodes = jobElement.childNodes;

  for(var i = 0; i < jobChildNodes.length; i++){
    if(jobChildNodes[i].nodeName === 'jsr352:listener'){
      return [];
    }
  }

  validationResult.push(checkUtil.createValidationInfo(
      jobElement,
      messageUtil.getMessage('Job [Listener] should be set.', appInfo.locale),
      checkUtil.errorTypes.warning
  ));

  return validationResult;
}

module.exports = jobListenerCheck;