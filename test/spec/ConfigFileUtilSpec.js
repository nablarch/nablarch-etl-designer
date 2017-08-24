'use strict';

var expect = require('chai').expect;

var configFileUtil = require('../../etl/renderer/util/ConfigFileUtil');

describe('config file util', function() {
  describe('read config file', function() {
    it('get properties', function(){
      var expected = {
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
      };
      var actual = configFileUtil.loadConfigFile().properties;

      expect(actual).to.exist;
      expect(expected).to.deep.equal(actual);
    });

    it('get JobStreamer info', function() {
      var expected = {
        hostName:'localhost',
        portNumber:45102
      };
      var actual = configFileUtil.loadConfigFile().jobStreamer;

      expect(actual).to.exist;
      expect(expected).to.deep.equal(actual);
    });

    it('get locale', function() {
      var expected = 'en';
      var actual = configFileUtil.loadConfigFile().locale;

      expect(actual).to.exist;
      expect(expected).to.equal(actual);
    });
  });
});