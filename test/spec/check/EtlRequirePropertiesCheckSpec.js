'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var etlRequirePropertiesCheck = require('../../../etl/renderer/util/check/EtlRequirePropertiesCheck');

var stepTestCases = [

];

var refTestCases = [

];

describe('ETL required properties check test', function () {
  describe('step properties check', function () {
    for(var i = 0; i < stepTestCases.length; i++){
      it(stepTestCases[i].caseName, testEtlRequirePropertiesCheck(stepTestCases[i]));
    }
  });

  describe('ref properties check', function () {
    for(var i = 0; i < refTestCases.length; i++){
      it(refTestCases[i].caseName, testEtlRequirePropertiesCheck(refTestCases[i]));
    }
  });
});

function testEtlRequirePropertiesCheck(testCase) {
  return function() {
    var parser = new DOMParser();
    var bpmnXmlString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");

    var actual = etlRequirePropertiesCheck(bpmnDom);

    expect(testCase.expected).to.deep.equal(actual);
  }
}