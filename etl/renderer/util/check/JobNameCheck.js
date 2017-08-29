'use strict';

var checkUtil = require('../CheckUtil');
var messageUtil = require('../MessageUtil');

function jobNameCheck(bpmnDom){
  var validationResult = [];
  var jobElements = bpmnDom.getElementsByTagName('job');
  var jobName = jobElements[0].getAttribute('bpmn:name');

  if(!jobName){
    validationResult.push(checkUtil.createValidationInfo(
        jobElements[0],
        messageUtil.getMessage('Job [Name] must be set.'),
        checkUtil.errorTypes.error
    ));
  }

  return validationResult;
}

module.exports = jobNameCheck;