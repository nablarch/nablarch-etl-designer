'use strict';

var fs = require('fs');
var edn = require('edn');

var jobStreamerApiUtil = require('./JobStremaerApiUtil');

function ExportJobXml(){
}

ExportJobXml.exportXml = function(bpmnXmlString) {
  bpmnXmlString = bpmnXmlString.replace('\r', '').replace('\n', '');
  return callExportJobXml([{ednKey:'job-bpmn-xml', ednValue: bpmnXmlString}]);
};

function callExportJobXml(args) {
  var token = jobStreamerApiUtil.callAuthToken();
  var postData = jobStreamerApiUtil.createPostData(args);
  var ednObj = jobStreamerApiUtil.executeJobStreamerApi('POST', '/jobs/convert-xml', postData, token, false);

  return jobStreamerApiUtil.getValueFromEdnObject(ednObj, 'job-xml');
}

module.exports = ExportJobXml;