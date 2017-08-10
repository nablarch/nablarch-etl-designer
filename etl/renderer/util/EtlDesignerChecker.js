'use strict';

var fs = require('fs');

var electron = window.require('electron');
var remote = electron.remote;

var appInfo = remote.getGlobal('appInfo');

var checkUtil = require('./CheckUtil');
var etlRequirePropertiesCheck = require('./check/EtlRequirePropertiesCheck');
var stepNameCheck = require('./check/StepNameCheck');
var jobListenerCheck = require('./check/jobListenerCheck');

function EtlDesignChecker(){
}

EtlDesignChecker.check = function(){
  var bpmnXmlString = appInfo.workBpmnString;
  var parser = new DOMParser();
  var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");
  var checkerFuncs =
      [
        // fooCheck,
        // barCheck,
        etlRequirePropertiesCheck,
        stepNameCheck
        // jobListenerCheck
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

function fooCheck(bpmnDom) {
  return ["foo1", "foo2"];
}

function barCheck(bpmnDom) {
  return ["bar1", "bar2"];
}

module.exports = EtlDesignChecker;

