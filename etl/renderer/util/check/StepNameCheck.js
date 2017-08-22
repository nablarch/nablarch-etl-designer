'use strict';

var checkUtil = require('../CheckUtil');

function stepNameCheck(bpmnDom){
  var nameSet = {};
  var validationResult = [];
  var stepElements = bpmnDom.getElementsByTagName('step');

  for(var i = 0; i < stepElements.length; i++){
    var stepName = stepElements[i].getAttribute('name');
    if(!stepName){
      validationResult.push(checkUtil.createValidationInfo(
          stepElements[i],
          'Stepの名前が設定されていません',
          checkUtil.errorTypes.warning
      ));
      continue;
    }

    if(!nameSet[stepName]){
      nameSet[stepName] = [];
    }
    nameSet[stepName].push(stepElements[i]);
  }

  for(var key in nameSet){
    var elements = nameSet[key];
    if(elements.length > 1){
      for(var i = 0; i < elements.length; i++){
        validationResult.push(checkUtil.createValidationInfo(
            elements[i],
            'Stepの名前が重複しています',
            checkUtil.errorTypes.error
        ));
      }
    }
  }

  return validationResult;
}

module.exports = stepNameCheck;