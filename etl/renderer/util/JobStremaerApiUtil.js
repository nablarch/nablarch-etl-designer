'use strict';

var edn = require('edn');

var configFileUtil = require('./ConfigFileUtil');
var messageUtil = require('./MessageUtil');

function jobStreamerApiUtil() {

}

jobStreamerApiUtil.callAuthToken = function () {
  var args = [{ednKey: 'user/id', ednValue: 'admin'}, {
    ednKey: 'user/password',
    ednValue: 'password123'
  }];
  var postData = jobStreamerApiUtil.createPostData(args);
  var ednObj = jobStreamerApiUtil.executeJobStreamerApi('POST', '/auth', postData, null, false);

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

jobStreamerApiUtil.executeJobStreamerApi = function (method, url, postData, token, async, onloadCallback) {
  var jobStreamerInfo = configFileUtil.getJobStreamerInfo();
  var apiUrl = jobStreamerInfo.url;
  onloadCallback = onloadCallback || function(){};

  var xhr = new XMLHttpRequest();
  xhr.open(method, apiUrl + url, async);
  xhr.setRequestHeader('Content-Type', 'application/edn');
  if (token) {
    xhr.setRequestHeader('Authorization', 'Token ' + token);
  }

  if(!async){
    xhr.send(postData);

    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(messageUtil.getMessage('Failed to call control-bus API. ({0})', [xhr.status]));
    }

    return xhr.responseText;
  }else{
    xhr.onload = function () {
      if (xhr.status < 200 || xhr.status >= 300) {
        throw new Error(messageUtil.getMessage('Failed to call control-bus API. ({0})', [xhr.status]));
      }
      onloadCallback(xhr);
    };
    xhr.send(postData);
  }
};

module.exports = jobStreamerApiUtil;