'use strict';

var checkUtil = require('../CheckUtil');
var messageUtil = require('../MessageUtil');

function etlRequirePropertiesCheck(bpmnDom) {
  var tagNames = [
    'step',
    'listener',
    'batchlet',
    'reader',
    'writer',
    'processor'
  ];

  var nodesGroup = [
    getStepNodes(),
    getListenerNodes(),
    getBatchletNodes(),
    getReaderNodes(),
    getWriterNodes(),
    getProcessorNodes()];

  var validationResult = [];
  for (var i = 0; i < tagNames.length; i++) {
    var nodes = nodesGroup[i];
    var elements = bpmnDom.getElementsByTagName(tagNames[i]);

    for (var j = 0; j < nodes.length; j++) {
      var node = nodes[j];
      checkRequire(validationResult, node, elements);
    }
  }
  return validationResult;
}

function checkRequire(validationResult, node, elements) {
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (node.matchAttr === '' || node.matchVal === element.getAttribute(node.matchAttr)) {
      for (var j = 0; j < node.attrs.length; j++) {
        var attr = node.attrs[j];
        var elementAttr = element.getAttribute(attr.name);
        if (!elementAttr) {
          validationResult.push(checkUtil.createValidationInfo(
              element,
              messageUtil.getMessage('"{0}" is required.', [(attr.label || attr.name)]),
              checkUtil.errorTypes.error
          ));
          continue;
        }
        switch (attr.type) {
          case 'integer':
            if (!checkUtil.isInteger(elementAttr)) {
              validationResult.push(checkUtil.createValidationInfo(
                  element,
                  messageUtil.getMessage('"{0}" must be integer.', [(attr.label || attr.name)]),
                  checkUtil.errorTypes.error
              ));
            }
            break;
        }
      }
    }
  }
}

module.exports = etlRequirePropertiesCheck;

function getStepNodes() {
  var result = [];
  var truncateNode =
      node('step', 'stepType', 'truncate', 'name',
          [attr('stepType', 'string'),
            attr('entities', 'stringArray', 'truncate entity')]
      );
  result.push(truncateNode);
  var validationNode =
      node('step', 'stepType', 'validation', 'name',
          [attr('stepType', 'string'),
            attr('bean', 'string'),
            attr('errorEntity', 'string')]
      );
  result.push(validationNode);
  var file2dbNode =
      node('step', 'stepType', 'file2db', 'name',
          [attr('stepType', 'string'),
            attr('bean', 'string'),
            attr('fileName', 'string')]
      );
  result.push(file2dbNode);
  var db2dbNode =
      node('step', 'stepType', 'db2db', 'name',
          [attr('stepType', 'string'),
            attr('bean', 'string'),
            attr('sqlId', 'string')]
      );
  result.push(db2dbNode);
  var db2fileNode =
      node('step', 'stepType', 'db2file', 'name',
          [attr('stepType', 'string'),
            attr('bean', 'string'),
            attr('fileName', 'string'),
            attr('sqlId', 'string')]
      );
  result.push(db2fileNode);
  return result;
}

function getListenerNodes() {
  var result = [];
  var listenerNode =
      node('listener', '', '', 'ref',
          [attr('ref', 'string', messageUtil.getMessage('Listener name (ref)'))]
      );
  result.push(listenerNode);
  return result;
}

function getBatchletNodes() {
  var result = [];
  var batchletNode =
      node('batchlet', '', '', 'ref',
          [attr('ref', 'string', messageUtil.getMessage('Batchlet name (ref)'))]
      );
  result.push(batchletNode);
  return result;
}

function getReaderNodes() {
  var result = [];
  var readerNode =
      node('reader', '', '', 'ref',
          [attr('ref', 'string', messageUtil.getMessage('Reader name (ref)'))]
      );
  result.push(readerNode);
  return result;
}

function getWriterNodes() {
  var result = [];
  var writerNode =
      node('writer', '', '', 'ref',
          [attr('ref', 'string', messageUtil.getMessage('Writer name (ref)'))]
      );
  result.push(writerNode);
  return result;
}

function getProcessorNodes() {
  var result = [];
  var processorNode =
      node('processor', '', '', 'ref',
          [attr('ref', 'string', messageUtil.getMessage('Processor name (ref)'))]
      );
  result.push(processorNode);
  return result;
}

function node(tagName, matchAttr, matchVal, nameAttr, attrs) {
  return {
    'tagName': tagName,
    'matchAttr': matchAttr,
    'matchVal': matchVal,
    'nameAttr': nameAttr,
    'attrs': attrs
  };
}

function attr(attrName, attrType, attrLabel) {
  return {
    'name': attrName,
    'type': attrType,
    'label': attrLabel || ''
  };
}