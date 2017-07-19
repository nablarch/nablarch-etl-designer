'use strict';

var inherits = require('inherits'),
    isObject = require('lodash/lang/isObject'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var componentsToPath = require('diagram-js/lib/util/RenderUtil').componentsToPath,
    createLine = require('diagram-js/lib/util/RenderUtil').createLine;

var TextUtil = require('../../util/CustomText');

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create');

var LABEL_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px'
};

function splitStr(str, count){

  str = str || '';
  count = count || 10;

  var strArray = str.split('');
  var result = '';

  for(var i = 0; i < strArray.length; i++){
    result += strArray[i];
    if(i !== 0 && i % count === 0){
      result += '\n';
    }
  }

  return result;
}

function extractClassName(str) {
  if(!str) {
    return "";
  }
  var array = str.split(".");
  return array[array.length - 1];
}

var textUtil = new TextUtil({
  style: LABEL_STYLE,
  size: { width: 100 }
});

 function drawDasharrayRect(parentGfx, width, height, r, offset) {

  offset = offset || 0;

   var attrs = {
     stroke: 'black',
     strokeDasharray: '8 8',
     strokeWidth: 2,
     fill: 'white'
   };

  var rect = svgCreate('rect');
  svgAttr(rect, {
    x: offset,
    y: offset,
    width: width - offset * 2,
    height: height - offset * 2,
    rx: r,
    ry: r
  });
  svgAttr(rect, attrs);

  svgAppend(parentGfx, rect);

  return rect;
}

var EtlDesignerRenderer = require('../../../../jsr352-js/app/jsr352-modeler/jsr352/JSR352Renderer');

module.exports = EtlDesignerRenderer;

EtlDesignerRenderer.$inject = [ 'eventBus', 'styles', 'bpmnRenderer' ];

EtlDesignerRenderer.prototype.drawShape = function(p, element){
  var type = element.type;
  // temporary solution: Element.di.isExpanded should be set.
  if (/^jsr352\:/.test(type)) {
    element.collapsed = false;
  }
  if (is(element, 'jsr352:Step')) {
    var step = this.drawRect(p, element.width, element.height, 0, 0);
    this.drawRect(p, 40,20, 0, 0);
    this.renderLabel(p, "Step",
        {
          box: {width: 40, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#000000'}});
    this.renderLabel(p, element.businessObject.name, { box: element, align: 'center-top', padding: 1});
    // var inputLabel = this.drawRect(p, element.width/2, 20, 0, {x:0, y: element.height-20});
    // var outputLabel = this.drawRect(p, element.width/2, 20, 0, {x:element.width/2, y: element.height-20});
    if(element.businessObject.stepType === 'validation') {
      textUtil.createText(p, splitStr(element.businessObject.bean) || '',
          {
            box: element,
            align: 'left-bottom',
            padding: 1
          });
    }else if(element.businessObject.stepType === 'file2db'){
      textUtil.createText(p, splitStr(element.businessObject.fileName) || '', {box: element, align: 'left-bottom', padding: 1});
      textUtil.createText(p, splitStr(element.businessObject.bean) || '', {box: element, align: 'right-bottom', padding: 1});

    }else if(element.businessObject.stepType === 'db2db'){
      textUtil.createText(p, splitStr(element.businessObject.bean) || '', {box: element, align: 'right-bottom', padding: 1});

    }else if(element.businessObject.stepType === 'db2file'){
      textUtil.createText(p, splitStr(element.businessObject.bean) || '',
          {
            box: element,
            align: 'left-bottom',
            padding: 1
          });
      textUtil.createText(p, splitStr(element.businessObject.fileName) || '',
          {
            box: element,
            align: 'right-bottom',
            padding: 1
          });
    }
    return step;
  }
  else if (is(element, 'jsr352:TextBox')) {
    var text = drawDasharrayRect(p, element.width, element.height, 10, 0);
    this.renderLabel(p, element.businessObject.name, { box: element, align: 'left-top', padding: 1, style:{fontSize: element.businessObject.fontSize}});
    return text;
  }
  else if (type === 'jsr352:Batchlet') {
    var batchlet = this.drawRect(p, element.width, element.height, 0, 0);
    var batchletLabel = this.drawRect(p, 20, element.height, 0, 0, {
      fill: '#000000'
    });
    this.renderLabel(p, "B",
        {
          box: {width: 20, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#ffffff'}});
    this.renderLabel(p,extractClassName(element.businessObject.ref),
        {
          box: {width: element.width - 20, height: element.height, x: 20, y: 0},
          align: 'center-middle',
          padding: {left:22},
          style: {fill: '#000000'}});
    return batchlet;
  }
  else if (type === 'jsr352:Chunk') {
    return this.drawRect(p, element.width, element.height, 10, 0);
  }
  else if (type === 'jsr352:Reader') {

    var reader = this.drawRect(p, element.width, element.height, 0, 0);
    var readerLabel = this.drawRect(p, 20, element.height, 0, 0, {
      fill: '#fc9303'
    });
    this.renderLabel(p, "R",
        {
          box: {width: 20, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#ffffff'}});
    this.renderLabel(p,extractClassName(element.businessObject.ref),
        {
          box: {width: element.width - 20, height: element.height, x: 20, y: 0},
          align: 'center-middle',
          padding: {left:22},
          style: {fill: '#000000'}});
    return reader;
  }
  else if (type === 'jsr352:Processor') {
    var reader = this.drawRect(p, element.width, element.height, 0, 0);
    var readerLabel = this.drawRect(p, 20, element.height, 0, 0, {
      fill: '#b1d412'
    });
    this.renderLabel(p, "P",
        {
          box: {width: 20, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#ffffff'}});
    this.renderLabel(p,extractClassName(element.businessObject.ref),
        {
          box: {width: element.width - 20, height: element.height, x: 20, y: 0},
          align: 'center-middle',
          padding: {left:22},
          style: {fill: '#000000'}});
    return reader;
  }
  else if (type === 'jsr352:Writer') {
    var writer = this.drawRect(p, element.width, element.height, 0, 0);
    var writerLabel = this.drawRect(p, 20, element.height, 0, 0, {
      fill: '#a1e0fc'
    });
    this.renderLabel(p, "W",
        {
          box: {width: 20, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#ffffff'}});
    this.renderLabel(p,extractClassName(element.businessObject.ref),
        {
          box: {width: element.width - 20, height: element.height, x: 20, y: 0},
          align: 'center-middle',
          padding: {left:22},
          style: {fill: '#000000'}});
    return writer;
  }
  else if (type === 'jsr352:Listener') {
    var listener = this.drawRect(p, element.width, element.height, 0, 0);
    var listenerLabel = this.drawRect(p, 20, element.height, 0, 0, {
      fill: '#e8e7e0'
    });
    this.renderLabel(p, "L",
        {
          box: {width: 20, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#ffffff'}});

    this.renderLabel(p,extractClassName(element.businessObject.ref),
        {
          box: {width: element.width - 20, height: element.height, x: 20, y: 0},
          align: 'center-middle',
          padding: {left:22},
          style: {fill: '#000000'}});
    return listener;
  }
  else if (type === 'jsr352:Flow') {
    var flow = this.drawShapeByType(p,element,'bpmn:Activity');
    this.drawRect(p, 40,20, 0, 0);
    this.renderLabel(p, "Flow",
        {
          box: {width: 40, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#000000'}});
    this.renderLabel(p, element.businessObject.name, { box: element, align: 'center-top', padding: 1});
    return flow;
  }
  else if (type === 'jsr352:Split') {
    var split = this.drawShapeByType(p,element,'bpmn:Lane');
    this.drawRect(p, 40,20, 0, 0);
    this.renderLabel(p, "Split",
        {
          box: {width: 40, height: 20, x: 0, y: 0},
          align: 'center-middle',
          padding: 1,
          style: {fill: '#000000'}});
    this.renderLabel(p, element.businessObject.name, { box: element, align: 'center-top', padding: 1});
    return split;
  }
  else if (type === 'jsr352:Start') {
    return this.drawShapeByType(p, element, 'bpmn:StartEvent');
  }
  else if (type === 'jsr352:End') {
    this.drawShapeByType(p, element, 'bpmn:EndEvent');
    return this.drawShapeByType(p, element, 'bpmn:TerminateEventDefinition');
  }
  else if (type === 'jsr352:Fail') {
    this.drawShapeByType(p, element, 'bpmn:EndEvent');
    return this.drawShapeByType(p, element, 'bpmn:ErrorEventDefinition');
  }
  else if (type === 'jsr352:Stop') {
    return this.drawShapeByType(p, element, 'bpmn:IntermediateEvent');
  }
};

