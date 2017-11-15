'use strict';

var path = require('path');
var fs = require('fs');

var messageUtil = require('./MessageUtil');

var appConfigFileName = 'appConfig';
var propertiesConfigFileName = 'propertiesConfig';

var registry = {};
var initConfig = {};
initConfig[appConfigFileName] = {
  jobStreamer: {
    url: "https://alfort.adc-tis.com/job-streamer-control-bus",
    timeoutCount: 20
  },
  locale: "ja",
  xmlAttr: {
    xmlns: "http://xmlns.jcp.org/xml/ns/javaee",
    version: "1.0"
  }
};
initConfig[propertiesConfigFileName] = {
  batchlet: [
    "tableCleaningBatchlet",
    "sqlLoaderBatchlet",
    "validationBatchlet",
    "deleteInsertBatchlet",
    "mergeBatchlet"
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
  entities: [],
  bean: [],
  errorEntity: [],
  mode: [
    "ABORT",
    "CONTINUE"
  ],
  columns: [],
  insertMode: [
    "NORMAL",
    "ORACLE_DIRECT_PATH"
  ],
  stepType: {
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
      "insertMode",
      "updateSize"
    ],
    db2file: [
      "bean",
      "fileName",
      "sqlId"
    ]
  }
};


function ConfigFileUtil() {
}

function saveConfigFile(path, config) {
  fs.writeFileSync(path, JSON.stringify(config, null, '    '), 'utf8');
}

function loadConfigFile(path) {
  checkFileExists(path);
  try {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(messageUtil.getMessage('Config file is invalid.\nFile: {0}', [path]));
  }

}

function checkFileExists(path) {
  path = path || '';
  if (!fs.existsSync(path)) {
    throw new Error(messageUtil.getMessage('Config file is not exist.\nFile: {0}', [path]));
  }
}

ConfigFileUtil.init = function (registryDirPath, configDirPath) {
  var registryFilePath = path.join(registryDirPath, '/registry.json');
  registry[appConfigFileName] = path.join(configDirPath, '/' + appConfigFileName + '.json');
  registry[propertiesConfigFileName] = path.join(configDirPath, '/' + propertiesConfigFileName + '.json');
  initConfig.registry = registry;

  if (!fs.existsSync(registryFilePath)) {
    fs.writeFileSync(registryFilePath, JSON.stringify(registry, null, '    '), 'utf8');
  }

  for (var key in initConfig.registry) {
    if (!initConfig.registry.hasOwnProperty(key)) {
      continue;
    }
    if (!fs.existsSync(initConfig.registry[key])) {
      fs.writeFileSync(initConfig.registry[key], JSON.stringify(initConfig[key], null, '    '), 'utf8');
    }
  }

  registry = loadConfigFile(registryFilePath);
};

ConfigFileUtil.isDevelop = function () {
  return loadConfigFile(registry.appConfig).isDevelop;
};

ConfigFileUtil.getJobStreamerInfo = function () {
  return loadConfigFile(registry.appConfig).jobStreamer;
};

ConfigFileUtil.getLocale = function () {
  return loadConfigFile(registry.appConfig).locale;
};

ConfigFileUtil.getXmlAttr = function () {
  return loadConfigFile(registry.appConfig).xmlAttr;
};

ConfigFileUtil.getProperties = function () {
  return loadConfigFile(registry.propertiesConfig);
};

ConfigFileUtil.setProperties = function (config) {
  saveConfigFile(registry.propertiesConfig, config);
};

module.exports = ConfigFileUtil;