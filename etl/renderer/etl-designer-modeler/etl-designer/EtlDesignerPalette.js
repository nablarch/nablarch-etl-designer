'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
function EtlDesignerPaletteProvider(palette, create, elementFactory, spaceTool, lassoTool, translate) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._translate = translate;

  palette.registerProvider(this);
}

module.exports = EtlDesignerPaletteProvider;

EtlDesignerPaletteProvider.$inject = [ 'palette', 'create', 'elementFactory', 'spaceTool', 'lassoTool', 'translate' ];


EtlDesignerPaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      translate = this._translate;


  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    var shortType = type.replace(/^[^\:]*\:/, '');

    return {
      group: group,
      className: className,
      title: title || 'Create ' + shortType,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  assign(actions, {
    'jsr352-step': createAction(
      'jsr352:Step', 'custom', 'icon-jsr352-step'
    ),
    'jsr352-flow': createAction(
      'jsr352:Flow', 'custom', 'icon-jsr352-flow'
    ),
    'jsr352-split': createAction(
      'jsr352:Split', 'custom', 'icon-jsr352-split'
    ),
    'jsr352-textBox': createAction(
        'jsr352:TextBox', 'custom', 'icon-jsr352-textBox'
    ),
    'batch-component-separator': {
      group: 'custom',
      separator: true
    },
    'jsr352-batchlet': createAction(
      'jsr352:Batchlet', 'custom', 'icon-jsr352-batchlet'
    ),
    'jsr352-chunk': createAction(
      'jsr352:Chunk', 'custom', 'icon-jsr352-chunk'
    ),
    'jsr352-listener': createAction(
      'jsr352:Listener', 'custom', 'icon-jsr352-listener'
    ),
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: 'Activate the lasso tool',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: 'Activate the create/remove space tool',
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.start': createAction(
      'jsr352:Start', 'event', 'bpmn-icon-start-event-none'
    ),
    'create.end-event': createAction(
      'jsr352:End', 'event', 'bpmn-icon-end-event-terminate'
    ),
    'create.fail-event': createAction(
        'jsr352:Fail', 'event', 'bpmn-icon-end-event-error'
    ),
    'create.stop-event': createAction(
        'jsr352:Stop', 'event', 'bpmn-icon-intermediate-event-none'
    )
  });

  return actions;
};
