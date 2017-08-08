'use strict';

var fs = require('fs');

function ExportEtlJson() {
}

ExportEtlJson.exportJson = function (bpmnFilePath, outputFilePath) {
  var xmlString = fs.readFileSync(bpmnFilePath, 'utf8');
  var parser = new DOMParser();
  var bpmnDom = parser.parseFromString(xmlString, "text/xml");
  var rootNode = getRootNode();
  var elements = bpmnDom.getElementsByTagName(rootNode.tagName);
  var jsonObj = {};
  buildJson(jsonObj, rootNode, elements[0]);
  fs.writeFileSync(outputFilePath, JSON.stringify(jsonObj, null, '    '), 'utf8');
};

function getRootNode() {
  var root =
      node(null, 'job', '', '', '', '', false, []);
  var truncateNode =
      node(root, 'step', 'stepType', 'truncate', '', 'name', false,
          [attr('stepType', 'type', 'string'),
            attr('entities', 'entities', 'stringArray')]
      );
  var validationNode =
      node(root, 'step', 'stepType', 'validation', '', 'name', false,
          [attr('stepType', 'type', 'string'),
            attr('bean', 'bean', 'string'),
            attr('errorEntity', 'errorEntity', 'string'),
            attr('mode', 'mode', 'string'),
            attr('errorLimit', 'errorLimit', 'integer')]
      );
  var file2dbNode =
      node(root, 'step', 'stepType', 'file2db', '', 'name', false,
          [attr('stepType', 'type', 'string'),
            attr('bean', 'bean', 'string'),
            attr('fileName', 'fileName', 'string'),
            attr('sqlId', 'sqlId', 'string')]
      );
  var db2dbNode =
      node(root, 'step', 'stepType', 'db2db', '', 'name', true,
          [attr('stepType', 'type', 'string'),
            attr('bean', 'bean', 'string'),
            attr('sqlId', 'sqlId', 'string'),
            attr('mergeOnColumns', 'mergeOnColumns', 'stringArray')]
      );
  var updateSizeNode =
      node(db2dbNode, 'updateSize', '', '', 'updateSize', '', false,
          [attr('updateSize', 'size', 'integer'),
            attr('extractBean', 'bean', 'string')]
      );
  var db2fileNode =
      node(root, 'step', 'stepType', 'db2file', '', 'name', false,
          [attr('stepType', 'type', 'string'),
            attr('bean', 'bean', 'string'),
            attr('fileName', 'fileName', 'string'),
            attr('sqlId', 'sqlId', 'string')]
      );
  return root;
}

function node(parent, tagName, matchAttr, matchVal, fixedName, nameAttr, useParentElement, attrs) {
  var node = {
    "tagName": tagName,
    "matchAttr": matchAttr,
    "matchVal": matchVal,
    "fixedName": fixedName,
    "nameAttr": nameAttr,
    "useParentElement": useParentElement,
    "attrs": attrs,
    "childNodes": []
  };
  if (parent !== null) {
    parent.childNodes.push(node);
  }
  return node;
}

function attr(attrName, jsonProp, attrType) {
  var attr = {
    "name": attrName,
    "jsonProp": jsonProp,
    "type": attrType
  };
  return attr;
}

function buildJson(jsonObj, node, element) {
  //node.tagName, matchAttr, matchVal, jsonProp, childAttrs, childNodes
  if (node.matchAttr === '' || node.matchVal === element.getAttribute(node.matchAttr)) {
    for (var i = 0; i < node.attrs.length; i++) {
      //attr.name, jsonProp, type
      var attr = node.attrs[i];
      var elementAttr = element.getAttribute(attr.name);
      if (!elementAttr) {
        continue;
      }
      switch (attr.type) {
        case 'string':
          jsonObj[attr.jsonProp] = elementAttr;
          break;
        case 'stringArray':
          jsonObj[attr.jsonProp] = elementAttr.split(',');
          break;
        case 'integer':
          jsonObj[attr.jsonProp] = Number(elementAttr);
          break;
      }
    }//j
  }
  for (var i = 0; i < node.childNodes.length; i++) {
    var childNode = node.childNodes[i];
    var tagName = childNode.tagName || '*';
    var childElements = element.getElementsByTagName(tagName);
    if(node.useParentElement){
      childElements = [element];
    }
    for (var j = 0; j < childElements.length; j++) {
      var childJsonObj = {};
      var childElement = childElements[j];
      var name = childNode.fixedName || childElement.getAttribute(childNode.nameAttr);
      buildJson(childJsonObj, childNode, childElement);
      if (JSON.stringify(childJsonObj) !== '{}') {
        jsonObj[name] = childJsonObj;
      }
    }
  }//i
}

module.exports = ExportEtlJson;