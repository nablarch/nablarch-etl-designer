var url = require('url');
var path = require('path');
var fs = require('fs');

// var electron =require('electron');
// var app = electron.app;

function ConfigFileUtil(){
}

var filePathOnBuild = './propertyConfig.json';
var filePathOnPackage = path.join(__dirname + '/propertyConfig.json');

// var configFilePath = path.join(app.getPath('userData'));

ConfigFileUtil.saveConfigFile = function(config){
  fs.writeFileSync(filePathOnBuild, JSON.stringify(config, null, '    '), 'utf8');
};

ConfigFileUtil.loadConfigFile = function(){
  return fs.readFileSync(filePathOnBuild, 'utf8');
};

ConfigFileUtil.isDevelop = function() {
  return JSON.parse(this.loadConfigFile()).isDevelop;
};


module.exports = ConfigFileUtil;