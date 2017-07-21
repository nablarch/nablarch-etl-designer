'use strict';

var inherits = require('inherits');

var pick = require('lodash/object/pick'),
    assign = require('lodash/object/assign');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var CommandInterceptor = require('diagram-js/lib/command/CommandInterceptor');

var Collections = require('diagram-js/lib/util/Collections');


/**
 * A handler responsible for updating the custom element's businessObject
 * once changes on the diagram happen.
 */
function EtlDesignerUpdater(eventBus, bpmnjs, elementFactory, bpmnFactory) {
  function createChildShape(type, parent, offset) {
    if (!offset) {
      offset = {x: 0, y: 0};
    }
    var shape = elementFactory.create(
        'shape',
        {
          type: type,
          x: parent.x + offset.x,
          y: parent.y + offset.y,
          parent: parent
        });
    bpmnjs.get('canvas').addShape(shape, parent);

    if (!parent.businessObject.flowElements) {
      parent.businessObject.flowElements =  [];
    }
    shape.businessObject.$parent=parent.businessObject;
    assign(shape.businessObject, pick(shape, [ 'x', 'y' ]));
    Collections.add(parent.businessObject.flowElements, shape.businessObject);
    Collections.add(bpmnjs._customElements, shape.businessObject);
    assign(shape.businessObject.di.bounds, pick(shape, [ 'x', 'y', 'width','height' ]));
    assign(shape.businessObject.di.$parent, parent.businessObject.di.$parent);
    Collections.add(bpmnjs.definitions.diagrams["0"].plane.planeElement, shape.businessObject.di);
  }

  CommandInterceptor.call(this, eventBus);

  function updateCustomElement(e) {
    var context = e.context,
        shape = context.shape,
        businessObject = shape.businessObject;

    if (!isCustom(shape)) {
      return;
    }

    var parent = shape.parent;

    var customElements = bpmnjs._customElements;

    // make sure element is added / removed from bpmnjs.customElements
    if (!parent) {
      Collections.remove(customElements, businessObject);
    } else {
      Collections.add(customElements, businessObject);
      if (e.command == 'shape.create') {
        if (is(shape, 'jsr352:Chunk')) {
          if(!shape.businessObject.copied){
            createChildShape('jsr352:Reader', shape, {x: 5, y: 5});
            createChildShape('jsr352:Writer', shape, {x: 5, y: 30});
            createChildShape('jsr352:Processor', shape, {x: 5, y: 55});
          }else{
            delete shape.businessObject.copied;
          }

        }
      }
    }

    // save custom element position
    assign(businessObject, pick(shape, [ 'x', 'y' ]));
  }

  function updateCustomConnection(e) {

    var context = e.context,
        connection = context.connection,
        source = connection.source,
        target = connection.target,
        businessObject = connection.businessObject;

    var parent = connection.parent;

    var customElements = bpmnjs._customElements;

    // make sure element is added / removed from bpmnjs.customElements
    if (!parent) {
      Collections.remove(customElements, businessObject);
    } else {
      Collections.add(customElements, businessObject);
    }

    // update waypoints
    assign(businessObject, {
      waypoints: copyWaypoints(connection)
    });

    if (source && target) {
      assign(businessObject, {
        source: source.id,
        target: target.id
      });
    }
  }

  this.executed([
    'shape.create',
    'shape.move',
    'shape.delete'
  ], ifCustomElement(updateCustomElement));

  this.reverted([
    'shape.create',
    'shape.move',
    'shape.delete'
  ], ifCustomElement(updateCustomElement));

  this.executed([
    'connection.create',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifCustomElement(updateCustomConnection));

  this.reverted([
    'connection.create',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifCustomElement(updateCustomConnection));

}

inherits(EtlDesignerUpdater, CommandInterceptor);

module.exports = EtlDesignerUpdater;

EtlDesignerUpdater.$inject = [ 'eventBus', 'bpmnjs', 'elementFactory', 'bpmnFactory' ];


/////// helpers ///////////////////////////////////

function copyWaypoints(connection) {
  return connection.waypoints.map(function(p) {
    return { x: p.x, y: p.y };
  });
}

function isCustom(element) {
  return element && /^jsr352\:/.test(element.type);
}

function ifCustomElement(fn) {
  return function(event) {
    var context = event.context,
        element = context.shape || context.connection;

    if (isCustom(element)) {
      fn(event);
    }
  };
}
