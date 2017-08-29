'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var stepNameCheck = require('../../../etl/renderer/util/check/StepNameCheck');

var testCases = [
  {
    caseName: 'no error and warning',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/step-name-check/correctTest.bpmn'),
    expected: []
  },
  {
    caseName: 'one error',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/step-name-check/oneErrorTest.bpmn'),
    expected: [
      {
        "elementType": "step",
        "errorType": "error",
        "id": "Step_1dmcndb",
        "message": "The step name is duplicated.",
        "name": "step1"
      },
      {
        "elementType": "step",
        "errorType": "error",
        "id": "Step_0sorbrl",
        "message": "The step name is duplicated.",
        "name": "step1"
      }
    ]
},
  {
    caseName: 'one warning',
    bpmnFilePath: path.join(__dirname, '../../resources/checker-test/step-name-check/oneWarningTest.bpmn'),
    expected: [
      {
        "elementType": "step",
        "errorType": "warning",
        "id": "Step_07du98s",
        "message": "Step name is required.",
        "name": null
      }
    ]
  }
];

describe('step name check test', function () {
  describe('step name check', function () {
    for(var i = 0; i < testCases.length; i++){
      it(testCases[i].caseName, testStepNameCheck(testCases[i]));
    }
  })
});

function testStepNameCheck(testCase) {
  return function() {
    var parser = new DOMParser();
    var bpmnXmlString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");

    var actual = stepNameCheck(bpmnDom);

    expect(testCase.expected).to.deep.equal(actual);
  }
}