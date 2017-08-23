'use strict';

var checkUtil = require('../CheckUtil');

function jobListenerCheck(bpmnDom){
  var validationResult = [];
  var jobElement = bpmnDom.getElementsByTagName('job')[0];
  var jobListenerElements = jobElement.getElementsByTagName('listener');

  if(jobListenerElements.length === 0){
    validationResult.push(checkUtil.createValidationInfo(
        jobElement,
        "jobの [Listener] が設定されていません",
        checkUtil.errorTypes.warning
    ));
  }

  return validationResult;
}

module.exports = jobListenerCheck;