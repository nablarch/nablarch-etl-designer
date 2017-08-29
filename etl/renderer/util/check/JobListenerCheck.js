'use strict';

var checkUtil = require('../CheckUtil');
var messageUtil = require('../MessageUtil');

function jobListenerCheck(bpmnDom){
  var validationResult = [];
  var jobElement = bpmnDom.getElementsByTagName('job')[0];
  var jobChildNodes = jobElement.childNodes;

  for(var i = 0; i < jobChildNodes.length; i++){
    if(jobChildNodes[i].nodeName === 'jsr352:listener'){
      if(jobChildNodes[i].getAttribute('ref') === 'nablarchJobListenerExecutor'){
        return [];
      }
    }
  }

  validationResult.push(checkUtil.createValidationInfo(
      jobElement,
      messageUtil.getMessage('nablarchJobListenerExecutor is not set.'),
      checkUtil.errorTypes.warning
  ));

  return validationResult;
}

module.exports = jobListenerCheck;