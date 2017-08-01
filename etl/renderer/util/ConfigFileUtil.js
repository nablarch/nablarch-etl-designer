var url = require('url');
var path = require('path');
var fs = require('fs');

function ConfigFileUtil(){
}

var configFilePath = './propertyConfig.json';
var initConfig = {
  properties: {
    batchlet: [],
    itemReader: [],
    itemWriter: [],
    itemProcessor: [],
    listener: [],
    stepType:{
      truncate: [
        "entities"
      ],
      validation: [
        "bean",
        "errorEntity",
        "mode",
        "errorLimit"
      ],
      file2db: [
        "fileName",
        "bean"
      ],
      db2db: [
        "extractBean",
        "bean",
        "sqlId",
        "updateSize"
      ],
      db2file: [
        "bean",
        "fileName",
        "sqlId"
      ]
    },
    entities:[],
    bean:[],
    errorEntity:[],
    mode: [
      "ABORT",
      "CONTINUE"
    ]
  },
  isDevelop: false
};

ConfigFileUtil.saveConfigFile = function(config){
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, '    '), 'utf8');
};

ConfigFileUtil.loadConfigFile = function(){
  if(!fs.existsSync(configFilePath)){
    fs.writeFileSync(configFilePath, JSON.stringify(initConfig, null, '    '), 'utf8');
  }
  return fs.readFileSync(configFilePath, 'utf8');
};

ConfigFileUtil.isDevelop = function() {
  return JSON.parse(this.loadConfigFile()).isDevelop;
};


module.exports = ConfigFileUtil;