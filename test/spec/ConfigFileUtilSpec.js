'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var registryDirPath = path.join(__dirname, '../resources');
var registryFilePath = path.join(registryDirPath, '/registry.json');
var configDirPath = path.join(__dirname, '../resources');

var configFileUtil = require('../../etl/renderer/util/ConfigFileUtil');

var registry = {
  appConfig: path.join(configDirPath, '/appConfig.json'),
  propertiesConfig: path.join(configDirPath, '/propertiesConfig.json')
};

var initConfig = {
  appConfig: {
    jobStreamer: {
      url:"http://localhost:45102",
      timeoutCount: 20
    },
    locale: "ja",
    xmlAttr: {
      xmlns: "http://xmlns.jcp.org/xml/ns/javaee",
      version: "1.0"
    }
  },
  propertiesConfig: {
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
    entities: [],
    bean: [],
    errorEntity: [],
    mode: [
      "ABORT",
      "CONTINUE"
    ],
    columns: [],
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
        "updateSize"
      ],
      db2file: [
        "bean",
        "fileName",
        "sqlId"
      ]
    }
  }
};

describe('config file util', function () {
  before(function () {
    if (fs.existsSync(registryFilePath)) {
      fs.unlinkSync(registryFilePath);
    }

    for (var key in registry) {
      if (fs.existsSync(registry[key])) {
        fs.unlinkSync(registry[key]);
      }
    }

    configFileUtil.init(registryDirPath, configDirPath);
  });

  after(function () {
    if (fs.statSync(registryFilePath)) {
      fs.unlinkSync(registryFilePath);
    }

    for (var key in registry) {
      if (fs.statSync(registry[key])) {
        fs.unlinkSync(registry[key]);
      }
    }
  });

  describe('init registry', function () {
    it('create registry file', function () {
      var expected = registry;
      var actual = JSON.parse(fs.readFileSync(path.join(registryDirPath, '/registry.json'), 'utf8'));

      expect(expected).to.deep.equal(actual);
    });

    it('create app config file', function () {
      var expected = initConfig.appConfig;
      var actual = JSON.parse(fs.readFileSync(registry.appConfig, 'utf8'));

      expect(expected).to.deep.equal(actual);
    });

    it('create properties config file', function () {
      var expected = initConfig.propertiesConfig;
      var actual = JSON.parse(fs.readFileSync(registry.propertiesConfig, 'utf8'));

      expect(expected).to.deep.equal(actual);
    });
  });

  describe('read app config file', function () {
    it('get JobStreamer info', function () {
      var expected = initConfig.appConfig.jobStreamer;
      var actual = configFileUtil.getJobStreamerInfo();

      expect(expected).to.deep.equal(actual);
    });

    it('get locale', function () {
      var expected = initConfig.appConfig.locale;
      var actual = configFileUtil.getLocale();

      expect(expected).to.equal(actual);
    });
  });

  describe('read properties config file', function () {
    it('get properties', function () {
      var expected = initConfig.propertiesConfig;
      var actual = configFileUtil.getProperties();

      expect(expected).to.deep.equal(actual);
    });
  });
});