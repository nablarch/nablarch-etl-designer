'use strict';

var edn = require('edn');

var configFileUtil = require('./ConfigFileUtil');
var messageUtil = require('./MessageUtil');

function jobStreamerApiUtil() {

}

jobStreamerApiUtil.callAuthToken = function (args) {
  var postData = jobStreamerApiUtil.createPostData(args);
  var ednObj = jobStreamerApiUtil.executeJobStreamerApi('POST', '/auth', postData);

  return jobStreamerApiUtil.getValueFromEdnObject(ednObj, 'token');
};

jobStreamerApiUtil.createPostData = function (args) {
  var ednArg = [];
  for (var i = 0; i < args.length; i++) {
    ednArg.push(edn.keyword(args[i].ednKey));
    ednArg.push(args[i].ednValue);
  }
  return edn.stringify(edn.map(ednArg));
};

jobStreamerApiUtil.getValueFromEdnObject = function (ednObj, ednKey) {
  return edn.valueOf(edn.parse(ednObj))[ednKey];
};

jobStreamerApiUtil.executeJobStreamerApi = function (method, url, postData, token) {
  var jobStreamerInfo = configFileUtil.getJobStreamerInfo();
  var hostName = jobStreamerInfo.hostName;
  var portNumber = jobStreamerInfo.portNumber;

  var xhr = new XMLHttpRequest();
  xhr.open(method, 'http://' + hostName + ':' + portNumber + url, false);
  xhr.setRequestHeader('Content-Type', 'application/edn');
  if (token) {
    xhr.setRequestHeader('Authorization', 'Token ' + token);
  }
  xhr.send(postData);

  if (xhr.status < 200 || xhr.status >= 300) {
    throw new Error(messageUtil.getMessage('Failed to call control-bus API. ({0})', [xhr.status]));
  }

  return xhr.responseText;
};

jobStreamerApiUtil.executeJobStreamerApiAsync = function (method, url, postData, token, onloadCallback) {
  var jobStreamerInfo = configFileUtil.getJobStreamerInfo();
  var hostName = jobStreamerInfo.hostName;
  var portNumber = jobStreamerInfo.portNumber;

  var xhr = new XMLHttpRequest();
  xhr.open(method, 'http://' + hostName + ':' + portNumber + url, true);
  xhr.setRequestHeader('Content-Type', 'application/edn');
  if (token) {
    xhr.setRequestHeader('Authorization', 'Token ' + token);
  }
  xhr.onload = function () {
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(messageUtil.getMessage('Failed to call control-bus API. ({0})', [xhr.status]));
    }
    onloadCallback(xhr);
  };
  xhr.send(postData);

};

module.exports = jobStreamerApiUtil;