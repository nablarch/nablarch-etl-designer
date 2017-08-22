'use strict';

var fs = require('fs');
var edn = require('edn');

var configFileUtil = require('./ConfigFileUtil');

function ExportJobXml(){
}

ExportJobXml.exportXml = function(bpmnXmlString, outputFilePath) {
  bpmnXmlString = bpmnXmlString.replace('\r', '').replace('\n', '');

  var result = callExportJobXml([{ednKey:'job-bpmn-xml', ednValue: bpmnXmlString}]);
  fs.writeFileSync(outputFilePath, result, 'utf8');
};

function callExportJobXml(args) {
  var token = callAuthToken([{ednKey:'user/id', ednValue:'admin'},{ednKey:'user/password', ednValue:'password123'}]);
  var postData = createPostData(args);
  var ednObj = executeJobStreamerApi('POST', '/jobs/convert-xml', postData, token);

  return getValueFromEdnObject(ednObj, 'job-xml');
}

function callAuthToken(args) {
  var postData = createPostData(args);
  var ednObj = executeJobStreamerApi('POST', '/auth', postData);

  return getValueFromEdnObject(ednObj, 'token');
}

function createPostData(args){
  var ednArg = [];
  for(var i=0; i<args.length ; i++) {
    ednArg.push(edn.keyword(args[i].ednKey));
    ednArg.push(args[i].ednValue);
  }
  return edn.stringify(edn.map(ednArg));
}

function getValueFromEdnObject(ednObj, ednKey){
  return edn.valueOf(edn.parse(ednObj))[ednKey];
}

function executeJobStreamerApi(method, url, postData, token){
  var jobStreamerInfo = configFileUtil.getJobStreamerInfo();
  var hostName = jobStreamerInfo.hostName;
  var portNumber = jobStreamerInfo.portNumber;

  var xhr = new XMLHttpRequest();
  xhr.open(method, 'http://' + hostName + ':' + portNumber +  url, false);
  xhr.setRequestHeader('Content-Type', 'application/edn');
  if(token){
    xhr.setRequestHeader('Authorization', 'Token ' + token);
  }
  xhr.send(postData);

  return xhr.responseText;
}


module.exports = ExportJobXml;