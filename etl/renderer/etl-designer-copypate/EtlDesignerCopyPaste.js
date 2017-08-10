'use strict';

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    is = ModelUtil.is;

var map = require('lodash/collection/map'),
    forEach = require('lodash/collection/forEach');

var copiedProperties = [
  'name',
  'text',
  'ref',
  'isInterrupting',
  'isForCompensation',
  'associationDirection',
  'triggeredByEvent',
  'cancelActivity'
];

var pastedProperties = [
  'name',
  'text',
  'ref',
  'isExpanded',
  'isInterrupting',
  'cancelActivity',
  'triggeredByEvent'
];

var removedProperties = [
  'name',
  'text',
  'ref',
  'eventDefinitions',
  'conditionExpression',
  'loopCharacteristics',
  'isInterrupting',
  'cancelActivity',
  'triggeredByEvent'
];

function setProperties(descriptor, data, properties) {
  forEach(properties, function (property) {
    if (data[property] !== undefined) {
      descriptor[property] = data[property];
    }
  });
}

function removeProperties(element, properties) {
  forEach(properties, function (prop) {
    if (element[prop]) {
      delete element[prop];
    }
  });
}

var BpmnCopyPaste = require('bpmn-js/lib/features/copy-paste/BpmnCopyPaste');

function JSR352CopyPaste(bpmnFactory, eventBus, copyPaste, clipboard, moddle, canvas, bpmnRules) {

  copyPaste.registerDescriptor(function (element, descriptor) {
    var businessObject = getBusinessObject(element),
        conditionExpression,
        eventDefinitions;

    descriptor.type = element.type;

    if (element.type === 'label') {
      return descriptor;
    }

    setProperties(descriptor, businessObject, copiedProperties);

    if (businessObject.default) {
      descriptor.default = businessObject.default.id;
    }

    if (businessObject.loopCharacteristics) {

      descriptor.loopCharacteristics = {
        type: businessObject.loopCharacteristics.$type,
        isSequential: businessObject.loopCharacteristics.isSequential
      };
    }

    setProperties(descriptor, businessObject.di, ['isExpanded']);

    if (is(businessObject, 'bpmn:SequenceFlow')) {
      conditionExpression = businessObject.get('conditionExpression');

      if (conditionExpression) {
        descriptor.conditionExpression = {
          type: conditionExpression.$type,
          body: conditionExpression.body
        };
      }
    }

    eventDefinitions = businessObject.get('eventDefinitions') || [];

    if (eventDefinitions.length) {
      descriptor.eventDefinitions = map(eventDefinitions, function (defs) {
        return defs.$type;
      });
    }

    return descriptor;
  });

  eventBus.on('element.paste', function (context) {
    var descriptor = context.descriptor,
        createdElements = context.createdElements,
        parent = descriptor.parent,
        rootElement = canvas.getRootElement(),
        businessObject,
        newEventDefinition,
        conditionExpression,
        loopCharacteristics,
        source,
        target,
        canConnect;

    if (descriptor.type === 'label') {
      return;
    }

    if (is(parent, 'bpmn:Process')) {
      descriptor.parent = is(rootElement, 'bpmn:Collaboration') ? rootElement : parent;
    }

    if (descriptor.type === 'bpmn:DataOutputAssociation' ||
        descriptor.type === 'bpmn:DataInputAssociation' ||
        descriptor.type === 'bpmn:MessageFlow') {
      descriptor.parent = rootElement;
    }

    if (is(parent, 'bpmn:Lane')) {
      descriptor.parent = parent.parent;
    }

    // make sure that the correct type of connection is created
    if (descriptor.waypoints) {
      source = createdElements[descriptor.source];
      target = createdElements[descriptor.target];

      if (source && target) {
        source = source.element;
        target = target.element;
      }

      canConnect = bpmnRules.canConnect(source, target);

      if (canConnect) {
        descriptor.type = canConnect.type;
      }
    }

    descriptor.businessObject = businessObject = bpmnFactory.create(descriptor.type);

    if (descriptor.type === 'bpmn:Participant' && descriptor.processRef) {
      descriptor.processRef = businessObject.processRef = bpmnFactory.create('bpmn:Process');
    }

    setProperties(businessObject, descriptor, pastedProperties);
    if(descriptor.type === 'jsr352:Chunk'){
      businessObject.copied = true;
    }


    if (descriptor.loopCharacteristics) {
      loopCharacteristics = descriptor.loopCharacteristics;

      businessObject.loopCharacteristics = moddle.create(loopCharacteristics.type);

      if (loopCharacteristics.isSequential) {
        businessObject.loopCharacteristics.isSequential = true;
      }

      businessObject.loopCharacteristics.$parent = businessObject;
    }

    if (descriptor.conditionExpression) {
      conditionExpression = descriptor.conditionExpression;

      businessObject.conditionExpression = moddle.create(conditionExpression.type, {body: conditionExpression.body});

      businessObject.conditionExpression.$parent = businessObject;
    }

    if (descriptor.eventDefinitions) {
      businessObject.eventDefinitions = map(descriptor.eventDefinitions, function (type) {
        newEventDefinition = moddle.create(type);

        newEventDefinition.$parent = businessObject;

        return newEventDefinition;
      });
    }

    removeProperties(descriptor, removedProperties);
  });
}

JSR352CopyPaste.$inject = [
  'bpmnFactory',
  'eventBus',
  'copyPaste',
  'clipboard',
  'moddle',
  'canvas',
  'bpmnRules'
];

JSR352CopyPaste.appendCopiedProperties = function(properties){
  properties.forEach(function(property){
    copiedProperties.push(property);
  });
};

JSR352CopyPaste.appendPastedProperties = function(properties){
  properties.forEach(function(property){
    pastedProperties.push(property);
  });
};

JSR352CopyPaste.appendRemovedProperties = function(properties){
  properties.forEach(function(property){
    removedProperties.push(property);
  });
};

module.exports = JSR352CopyPaste;