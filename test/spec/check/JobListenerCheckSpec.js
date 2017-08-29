'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var jobListenerCheck = require('../../../etl/renderer/util/check/JobListenerCheck');

var testCases = [
  {
    caseName: 'no error and warning',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/job-listener-check/correctTest.bpmn'),
    expected: []
  },
  {
    caseName: 'no job listener is placed',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/job-listener-check/noJobListenerTest.bpmn'),
    expected: [
      {
        "elementType": "job",
        "errorType": "warning",
        "id": "Job_1",
        "message": "nablarchJobListenerExecutor is not set.",
        "name": null
      }
    ]
  },
  {
    caseName: 'empty job listener is placed',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/job-listener-check/emptyJobListenerTest.bpmn'),
    expected: [
      {
        "elementType": "job",
        "errorType": "warning",
        "id": "Job_1",
        "message": "nablarchJobListenerExecutor is not set.",
        "name": null
      }
    ]
  },
  {
    caseName: 'wrong job listener is placed',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/job-listener-check/wrongJobListenerTest.bpmn'),
    expected: [
      {
        "elementType": "job",
        "errorType": "warning",
        "id": "Job_1",
        "message": "nablarchJobListenerExecutor is not set.",
        "name": null
      }
    ]
  }
];

describe('job listener check test', function () {
  describe('job listener check', function () {
    for(var i = 0; i < testCases.length; i++){
      it(testCases[i].caseName, testJobListenerCheck(testCases[i]));
    }
  })
});

function testJobListenerCheck(testCase) {
  return function() {
    var parser = new DOMParser();
    var bpmnXmlString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");

    var actual = jobListenerCheck(bpmnDom);

    expect(testCase.expected).to.deep.equal(actual);
  }
}