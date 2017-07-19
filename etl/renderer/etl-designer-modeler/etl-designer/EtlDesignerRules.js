'use strict';

var reduce = require('lodash/collection/reduce'),
    any = require('lodash/collection/any'),
    every = require('lodash/collection/every'),
    inherits = require('inherits');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny,
    isExpanded = require('bpmn-js/lib/util/DiUtil').isExpanded;

var BpmnRules = require('bpmn-js/lib/features/rules/BpmnRules');

var HIGH_PRIORITY = 1500;

var hasTransitionOutgoing = require('./EtlDesignerConnectRuleProvider').hasTransitionOutgoing;
var canConnectFromBatchComponent = require('./EtlDesignerConnectRuleProvider').canConnectFromBatchComponent;
var canConnectFromDataComponent = require('./EtlDesignerConnectRuleProvider').canConnectFromDataComponent;
var canConnectFromStart = require('./EtlDesignerConnectRuleProvider').canConnectFromStart;
var canReconnectStart = require('./EtlDesignerConnectRuleProvider').canReconnectStart;
var canReconnectEnd = require('./EtlDesignerConnectRuleProvider').canReconnectEnd;

function isJSR352(element) {
  return element && new RegExp('^jsr352:').test(element.type);
}

/**
 * Specific rules for custom elements
 */
function EtlDesignerRules(eventBus) {
  BpmnRules.call(this, eventBus);
}

inherits(EtlDesignerRules, BpmnRules);

EtlDesignerRules.$inject = [ 'eventBus' ];

module.exports = EtlDesignerRules;

/**
 * Can source and target be connected?
 */
function canConnect(source, target) {

  // only judge about custom elements
  if (!isJSR352(source) && !isJSR352(target)) {
    return {};
  }

  if(source == target){
    return false;
  }

  // allow connection between custom shape and task
  if (isJSR352(source)) {
    if(is(source, 'jsr352:BatchComponent')){
      return canConnectFromBatchComponent(source, target);
    }else if(is(source, 'jsr352:DataComponent')){
      return canConnectFromDataComponent(source, target);
    }else if(is(source, 'jsr352:Start')){
      return canConnectFromStart(source, target);
    }else{
      return false;
    }
  }
}

function canReconnect(source, target, connection){

}

function hasNoChildren(element, self) {
  return every(element.children, function(child) {
    return child == self || !isAny(child, ['jsr352:Batchlet', 'jsr352:Chunk']);
  });
}

EtlDesignerRules.prototype.init = function() {

  /**
   * Can shape be created on target container?
   */
  function canCreate(shape, target) {
    // only judge about custom elements
    if (!isJSR352(shape) || !target) {
      return;
    }

    if (isAny(shape, ['jsr352:Step'])) {
      return isAny(target, ['jsr352:Flow', 'jsr352:Job']);
    } else if (is(shape, 'jsr352:Listener')) {
      return isAny(target, ['jsr352:Step', 'jsr352:Job']);
    } else if (is(shape, 'jsr352:Flow')) {
      return isAny(target, ['jsr352:Split', 'jsr352:Job']);
    } else if (isAny(shape, ['jsr352:Batchlet', 'jsr352:Chunk'])) {
      return isAny(target, ['jsr352:Step']) && hasNoChildren(target, shape);
    } else if (isAny(shape, ['jsr352:Reader', 'jsr352:Processor', 'jsr352:Writer'])) {
      return isAny(target, ['jsr352:Chunk']);
    } else {
      return isAny(target, ['jsr352:Job']);
    }
  }

  function canAttach(shape, target){
    // only judge about custom elements
    if (!isJSR352(shape) || !target) {
      return;
    }

    if (isAny(shape, ['jsr352:Step'])) {
      return isAny(target, ['jsr352:Flow', 'jsr352:Job']);
    } else if (is(shape, 'jsr352:Listener')) {
      return isAny(target, ['jsr352:Step', 'jsr352:Job']);
    } else if (is(shape, 'jsr352:Flow')) {
      return isAny(target, ['jsr352:Split', 'jsr352:Job']);
    } else if (isAny(shape, ['jsr352:Batchlet', 'jsr352:Chunk'])) {
      return isAny(target, ['jsr352:Step']) && hasNoChildren(target, shape);
    } else if (isAny(shape, ['jsr352:Reader', 'jsr352:Processor', 'jsr352:Writer'])) {
      return isAny(target, ['jsr352:Chunk']);
    } else {
      return isAny(target, ['jsr352:Job']);
    }
  }

  function canCopy(collection, element) {
    if (is(element, 'bpmn:Lane') && !contains(collection, element.parent)) {
      return false;
    }

    if (is(element, 'bpmn:BoundaryEvent') && !contains(collection, element.host)) {
      return false;
    }

    return true;
  }

  function canPaste(tree, target) {

    var topLevel = tree[0],
        participants;

    if (is(target, 'bpmn:Collaboration')) {
      return every(topLevel, function(e) {
        return e.type === 'bpmn:Participant';
      });
    }

    if (is(target, 'bpmn:Process')) {
      participants = any(topLevel, function(e) {
        return e.type === 'bpmn:Participant';
      });

      return !(participants && target.children.length > 0);
    }

    // disallow to create elements on collapsed pools
    if (is(target, 'bpmn:Participant') && !isExpanded(target)) {
      return false;
    }

    if (is(target, 'bpmn:FlowElementsContainer')) {
      return isExpanded(target);
    }

    return isAny(target, [
      'bpmn:Collaboration',
      'bpmn:Lane',
      'bpmn:Participant',
      'bpmn:Process',
      'bpmn:SubProcess' ]);
  }

  this.addRule('elements.move', HIGH_PRIORITY, function(context) {

    var target = context.target,
        shapes = context.shapes;

    var type;

    // do not allow mixed movements of custom / BPMN shapes
    // if any shape cannot be moved, the group cannot be moved, too
    var allowed = reduce(shapes, function(result, s) {
      if (type === undefined) {
        type = isJSR352(s);
      }

      if (type !== isJSR352(s) || result === false) {
        return false;
      }

      return canCreate(s, target);
    }, undefined);

    // reject, if we have at least one
    // custom element that cannot be moved
    return allowed;
  });

  this.addRule('shape.create', HIGH_PRIORITY, function(context) {
    var target = context.target,
        shape = context.shape;

    return canCreate(shape, target);
  });

  this.addRule('shape.append', HIGH_PRIORITY, function(context) {

    var target = context.target,
        shape = context.shape;

    if(isAny(shape, ['jsr352:BatchComponent', 'jsr352:End', 'jsr352:Fail', 'jsr352:Stop']) && hasTransitionOutgoing(context.source)){
      return false;
    }

    return canAttach(shape, target);
  });

  this.addRule('shape.resize', HIGH_PRIORITY, function(context) {
    var shape = context.shape;

    if (isJSR352(shape) && !isAny(shape, ['jsr352:Flow', 'jsr352:Split', 'jsr352:Step', 'jsr352:File', 'jsr352:TextBox', 'jsr352:Database', 'jsr352:Listener'])) {
      // cannot resize custom elements
      return false;
    }
  });

  this.addRule('connection.create', HIGH_PRIORITY, function(context) {
    var source = context.source,
        target = context.target;

    return canConnect(source, target);
  });

  this.addRule('connection.reconnectStart', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = context.hover || context.source,
        target = connection.target;

    return canReconnectStart(source, target, connection);
  });

  this.addRule('connection.reconnectEnd', HIGH_PRIORITY, function(context) {
    var connection = context.connection,
        source = connection.source,
        target = context.hover || context.target;

    return canReconnectEnd(source, target, connection);
  });

  this.addRule('element.copy', HIGH_PRIORITY, function(context) {
    var collection = context.collection,
        element = context.element;

    return canCopy(collection, element);
  });

  this.addRule('element.paste', function(context) {
    var parent = context.parent,
        element = context.element,
        position = context.position,
        source = context.source,
        target = context.target;

    if (source || target) {
      return canConnect(source, target);
    }

    return canAttach([ element ], parent, null, position) || canCreate(element, parent, null, position);
  });

  this.addRule('elements.paste', function(context) {
    var tree = context.tree,
        target = context.target;

    return canPaste(tree, target);
  });

};

EtlDesignerRules.prototype.canConnect = canConnect;
