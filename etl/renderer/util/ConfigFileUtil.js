var url = require('url');
var path = require('path');
var fs = require('fs');

function ConfigFileUtil(){
}

var configFilePath = './propertyConfig.json';
var initConfig = {
  properties: {
    batchlet: [
      "tableCleaningBatchlet",
      "sqlLoaderBatchlet",
      "validationBatchlet"
    ],
    itemReader: [
      "databaseItemReader",
      "fileItemReader"
    ],
    itemWriter: [
      "databaseItemWriter",
      "fileItemWriter"
    ],
    itemProcessor: [],
    listener: [
      "nablarchJobListenerExecutor",
      "nablarchStepListenerExecutor",
      "nablarchItemWriteListenerExecutor",
      "progressLogListener"
    ],
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
        "mergeOnColumns",
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
    ],
    columns: []
  },
  isDevelop: false
};

ConfigFileUtil.saveConfigFile = function(config){
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, '    '), 'utf8');
};

ConfigFileUtil.loadConfigFile = function(){
  if(!fs.existsSync(configFilePath)){
    this.saveConfigFile(initConfig);
  }
  return JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
};

ConfigFileUtil.isDevelop = function() {
  return this.loadConfigFile().isDevelop;
};


module.exports = ConfigFileUtil;