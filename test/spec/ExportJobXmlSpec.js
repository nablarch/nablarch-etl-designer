'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var exportJobXml = require('../../etl/renderer/util/ExportJobXml');

var testCases = [
  {
    caseName: 'export one step job',
    bpmnFilePath: path.join(__dirname, '../resources/export-xml-test/oneStepJobTest.bpmn'),
    expectedFilePath: path.join(__dirname, '../resources/export-xml-test/oneStepJobTest.xml')
  }

];

describe('export job xml', function() {
  describe('export job', function() {
    for(var i = 0; i < testCases.length; i++){
      it(testCases[i].caseName, testExportJobXml(testCases[i]));
    }
  });
});

function testExportJobXml(testCase){
  return function(){
    var bpmnString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var expected = fs.readFileSync(testCase.expectedFilePath, 'utf8');
    var actual = exportJobXml.exportXml(bpmnString);

    expect(expected).to.deep.equal(actual);
  }
}