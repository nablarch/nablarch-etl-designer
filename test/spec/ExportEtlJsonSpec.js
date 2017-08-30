'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var exportEtlJson = require('../../etl/renderer/util/ExportEtlJson');

var testCases = [
  {
    caseName: 'truncate step',
    bpmnFilePath: path.join(__dirname, '../resources/export-json-test/truncateStepTest.bpmn'),
    expected: {
      truncate:{
        "type": "truncate",
        "entities": [
          "truncateEntity1",
          "truncateEntity2"
        ]
      }
    }
  },
  {
    caseName: 'validation abort step',
    bpmnFilePath: path.join(__dirname, '../resources/export-json-test/validationAbortStepTest.bpmn'),
    expected: {
      validation:{
        "type": "validation",
        "bean": "ValidationBean",
        "errorEntity": "ValidationErrorEntity",
        "mode": "ABORT"
      }
    }
  },
  {
    caseName: 'validation continue step',
    bpmnFilePath: path.join(__dirname, '../resources/export-json-test/validationContinueStepTest.bpmn'),
    expected: {
      "validation": {
        "type": "validation",
        "bean": "ValidationBean",
        "errorEntity": "ValidationErrorEntity",
        "mode": "CONTINUE",
        "errorLimit": 1000
      }
    }
  },
  {
    caseName: 'file2db step',
    bpmnFilePath: path.join(__dirname, '../resources/export-json-test/file2dbStepTest.bpmn'),
    expected: {
      "extract": {
        "type": "file2db",
        "fileName": "INPUT.csv",
        "bean": "InputBean"
      }
    }
  },
  {
    caseName: 'db2db step',
    bpmnFilePath: path.join(__dirname, '../resources/export-json-test/db2dbStepTest.bpmn'),
    expected: {
      "transform1": {
        "type": "db2db",
        "bean": "TransformedBean",
        "sqlId": "SQLID"
      },
      "transform2": {
        "type": "db2db",
        "bean": "TransformedBean",
        "sqlId": "SQLID",
        "mergeOnColumns": [
          "mergeColumn1",
          "mergeColumn2"
        ],
        "updateSize": {
          "size": 1000,
          "bean": "InputBean"
        }
      }
    }
  },
  {
    caseName: 'db2file step',
    bpmnFilePath: path.join(__dirname, '../resources/export-json-test/db2fileStepTest.bpmn'),
    expected: {
      "load": {
        "type": "db2file",
        "fileName": "OUTPUT.csv",
        "bean": "TransformedBean",
        "sqlId": "SQLID"
      }
    }
  }
];

describe('export etl json ', function() {
  describe('export each step type', function() {
    for(var i = 0; i < testCases.length; i++){
      it(testCases[i].caseName, testExportEtlJson(testCases[i]));
    }
  });
});

function testExportEtlJson(testCase){
  return function(){
    var bpmnString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var actual = exportEtlJson.exportJson(bpmnString);

    expect(testCase.expected).to.deep.equal(actual);
  }
}