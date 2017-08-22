'use strict';

var checkUtil = require('../CheckUtil');

function jobListenerCheck(bpmnDom){

  var validationResult = [];
  var jobElement = bpmnDom.getElementsByTagName('job')[0];

  console.log(jobElement);

  return validationResult;
}

module.exports = jobListenerCheck;