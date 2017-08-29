'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var configFilePath = './propertyConfig.json';
var tempConfigFilePath = './test/resources/propertyConfig.json';

var configFileUtil = require('../../etl/renderer/util/ConfigFileUtil');

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
  isDevelop: false,
  jobStreamer:{
    hostName:'localhost',
    portNumber:45102
  },
  locale: 'en'
};

describe('config file util', function() {
  before(function () {
    if(fs.existsSync(configFilePath)){
      fs.renameSync(configFilePath, tempConfigFilePath);
    }

    fs.writeFileSync(configFilePath, JSON.stringify(initConfig, null, '    '), 'utf8');
  });

  after(function () {
    fs.unlinkSync(configFilePath);
    fs.renameSync(tempConfigFilePath, configFilePath);
  });

  describe('read config file', function() {
    it('get properties', function(){
      var expected = initConfig.properties;
      var actual = configFileUtil.loadConfigFile().properties;

      expect(expected).to.deep.equal(actual);
    });

    it('get JobStreamer info', function() {
      var expected = initConfig.jobStreamer;
      var actual = configFileUtil.loadConfigFile().jobStreamer;

      expect(expected).to.deep.equal(actual);
    });

    it('get locale', function() {
      var expected = initConfig.locale;
      var actual = configFileUtil.loadConfigFile().locale;

      expect(expected).to.equal(actual);
    });
  });
});