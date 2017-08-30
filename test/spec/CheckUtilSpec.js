'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var checkUtil = require('../../etl/renderer/util/CheckUtil');

var testCasesCreateValidationInfo = [
  {
    caseName: 'create validation info',
    bpmnFilePath: path.join(__dirname, '../resources/check-util-test/createValidationInfoTest.bpmn'),
    tagName: 'step',
    message: 'message',
    errorType: 'errorType',
    expected: {
      id: 'Step_13fpdyn',
      name: 'elementName',
      elementType: 'step',
      message: 'message',
      errorType: 'errorType'
    }
  }
];

var testCasesIsInteger = [
  {
    caseName: 'number(10) isInteger return true',
    checkValue: 10,
    expected: true
  },
  {
    caseName: 'float(5.8) isInteger return false',
    checkValue: 5.8,
    expected: false
  },
  {
    caseName: 'string("10") isInteger return false',
    checkValue: '10',
    expected: false
  },
  {
    caseName: 'null isInteger return false',
    checkValue: null,
    expected: false
  }
];

var testCasesGetTagName = [
  {
    caseName: 'get step tag name',
    bpmnFilePath: path.join(__dirname, '../resources/check-util-test/createValidationInfoTest.bpmn'),
    tagName: 'step',
    expected: 'step'
  }
];

var testCasesFormatMessage = [
  {
    caseName: 'format message with name',
    validationInfo: {
      id: 'elementId',
      name: 'elementName',
      elementType: 'elementType',
      message: 'message',
      errorType: 'errorType'
    },
    expected: 'elementType name:[elementName] (ID:elementId): message'
  },
  {
    caseName: 'format message no name',
    validationInfo: {
      id: 'elementId',
      elementType: 'elementType',
      message: 'message',
      errorType: 'errorType'
    },
    expected: 'elementType ID:[elementId]: message'
  }
];

describe('check util', function() {
  describe('create validation info', function() {
    for(var i = 0; i < testCasesCreateValidationInfo.length; i++){
      it(testCasesCreateValidationInfo[i].caseName, testCreateValidationInfo(testCasesCreateValidationInfo[i]));
    }
  });

  describe('is integer', function() {
    for(var i = 0; i < testCasesIsInteger.length; i++){
      it(testCasesIsInteger[i].caseName, testIsInteger(testCasesIsInteger[i]));
    }
  });

  describe('get tag name', function() {
    for(var i = 0; i < testCasesGetTagName.length; i++){
      it(testCasesGetTagName[i].caseName, testGetTagName(testCasesGetTagName[i]));
    }
  });

  describe('format message', function() {
    for(var i = 0; i < testCasesFormatMessage.length; i++){
      it(testCasesFormatMessage[i].caseName, testFormatMessage(testCasesFormatMessage[i]));
    }
  });

});

function testCreateValidationInfo(testCase) {
  return function() {
    var parser = new DOMParser();
    var bpmnXmlString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");
    var element = bpmnDom.getElementsByTagName(testCase.tagName)[0];
    var actual = checkUtil.createValidationInfo(element, testCase.message, testCase.errorType);
    expect(testCase.expected).to.deep.equal(actual);
  }
}

function testIsInteger(testCase) {
  return function() {
    var actual = checkUtil.isInteger(testCase.checkValue);
    expect(testCase.expected).to.equal(actual);
  }
}

function testGetTagName(testCase) {
  return function() {
    var parser = new DOMParser();
    var bpmnXmlString = fs.readFileSync(testCase.bpmnFilePath, 'utf8');
    var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");
    var element = bpmnDom.getElementsByTagName(testCase.tagName)[0];
    var actual = checkUtil.getTagName(element);
    expect(testCase.expected).to.equal(actual);
  }
}

function testFormatMessage(testCase) {
  return function() {
    var actual = checkUtil.formatMessage(testCase.validationInfo);
    expect(testCase.expected).to.deep.equal(actual);
  }
}