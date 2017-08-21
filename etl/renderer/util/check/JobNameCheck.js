var checkUtil = require('../CheckUtil');

var electron = window.require('electron');
var remote = electron.remote;

var appInfo = remote.getGlobal('appInfo');

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
        'jobの［Name］ が設定されていません',
        checkUtil.errorTypes.error,
        checkUtil.validationTypes.required
    ));
  }else{
    appInfo.jobName = jobName;
  }

  return validationResult;
}

module.exports = jobNameCheck;