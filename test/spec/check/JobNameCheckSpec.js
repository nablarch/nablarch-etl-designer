'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var jobNameCheck = require('../../../etl/renderer/util/check/JobNameCheck');

var testCases = [
  {
    caseName: 'no error and warning',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/job-name-check/correctTest.bpmn'),
    expected: []
  },
  {
    caseName: 'one error',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/job-name-check/oneErrorTest.bpmn'),
    expected: [
      {
        "elementType": "job",
        "errorType": "error",
        "id": "Job_1",
        "message": "Job [Name] must be set.",
        "name": null
      }
    ]
  }
];

describe('job name check test', function () {
  describe('job name check', function () {
    for(var i = 0; i < testCases.length; i++){
      it(testCases[i].caseName, testJobNameCheck(testCases[i]));
    }
  })
});

function testJobNameCheck(testCase) {
  return function() {
    var parser = new DOMParser();
    var bpmnXmlString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");
    var actual = jobNameCheck(bpmnDom);

    expect(testCase.expected).to.deep.equal(actual);
  }
}