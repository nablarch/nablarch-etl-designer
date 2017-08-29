'use strict';

var fs = require('fs');

var checkUtil = require('./CheckUtil');
var etlRequirePropertiesCheck = require('./check/EtlRequirePropertiesCheck');
var stepNameCheck = require('./check/StepNameCheck');
var jobListenerCheck = require('./check/jobListenerCheck');
var jobNameCheck = require('./check/JobNameCheck');

function EtlDesignChecker(){
}

EtlDesignChecker.check = function(bpmnXmlString){
  var parser = new DOMParser();
  var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");
  var checkerFuncs =
      [
        jobNameCheck,
        etlRequirePropertiesCheck,
        stepNameCheck,
        jobListenerCheck
      ];
  return doCheck(bpmnDom, checkerFuncs);
};

function doCheck(bpmnDom, checkerFuncs){
  var errors = [];
  var warnings = [];
  for(var i=0; i<checkerFuncs.length; i++) {
    var checkerFunc = checkerFuncs[i];
    var results = checkerFunc(bpmnDom);
    for(var j=0; j<results.length; j++) {
      var result = results[j];
      var message = checkUtil.formatMessage(result);
      switch(result.errorType){
        case checkUtil.errorTypes.error:
          errors.push(message);
          break;
        case checkUtil.errorTypes.warning:
          warnings.push(message);
          break;
      }
    }
  }
  return {
    "errors": errors,
    "warnings": warnings
  };
}

module.exports = EtlDesignChecker;

