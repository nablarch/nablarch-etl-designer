'use strict';

var inherits = require('inherits');

var ContextPadProvider = require('bpmn-js/lib/features/context-pad/ContextPadProvider');

var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var assign = require('lodash/object/assign'),
    pick = require('lodash/object/pick'),
    bind = require('lodash/function/bind');

function ETLDesignerContextPadProvider(eventBus, contextPad, modeling, elementFactory, connect,
                                  create, popupMenu, canvas, rules, translate) {

  ContextPadProvider.call(this, eventBus, contextPad, modeling, elementFactory, connect, create,
                    popupMenu, canvas, rules, translate);

  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);

    var businessObject = element.businessObject;

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

    function appendAction(type, className, title, options) {

      if (typeof title !== 'string') {
        options = title;
        title = translate('Append {type}', { type: type.replace(/^jsr352\:/, '') });
      }

      function appendListener(event, element) {
        var shape = elementFactory.createShape(assign({ type: type, isExpanded: true }, options));
        create.start(event, shape, element);
      }

      return {
        group: 'model',
        className: className,
        title: title,
        action: {
          dragstart: appendListener,
          click: appendListener
        }
      };
    }

    function appendBatchComponentMenu(actions) {
      assign(actions, {
        'append.step': appendAction('jsr352:Step', 'icon-jsr352-step', 'Append step'),
        'append.flow': appendAction('jsr352:Flow', 'icon-jsr352-flow', 'Append flow'),
        'append.split': appendAction('jsr352:Split', 'icon-jsr352-split', 'Append split'),
        'append.end-event': appendAction('jsr352:End', 'bpmn-icon-end-event-terminate'),
        'append.fail-event': appendAction('jsr352:Fail', 'bpmn-icon-end-event-error'),
        'append.stop-event': appendAction('jsr352:Stop', 'bpmn-icon-intermediate-event-none'),
        'connect': {
          group: 'connect',
          className: 'bpmn-icon-connection-multi',
          title: translate('Connect using Transition'),
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });
    }

    function appendDataComponentMenu(actions) {
      assign(actions, {
        'connect': {
          group: 'connect',
          className: 'bpmn-icon-connection-multi',
          title: translate('Connect using Transition'),
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });
    }

    function appendStartMenu(actions) {
      assign(actions, {
        'append.step': appendAction('jsr352:Step', 'icon-jsr352-step', 'Append step'),
        'append.flow': appendAction('jsr352:Flow', 'icon-jsr352-flow', 'Append flow'),
        'append.split': appendAction('jsr352:Split', 'icon-jsr352-split', 'Append split'),
        'connect': {
          group: 'connect',
          className: 'bpmn-icon-connection-multi',
          title: translate('Connect using Transition'),
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });
    }

    if (isAny(businessObject, ['jsr352:Step', 'jsr352:Flow', 'jsr352:Split'])) {
      actions = pick(actions, ['connect', 'delete']);
      appendBatchComponentMenu(actions);
    } else if (isAny(businessObject, ['jsr352:Start'])) {
      actions = pick(actions, ['connect', 'delete']);
      appendStartMenu(actions);
    } else if( isAny(businessObject, ['jsr352:DataComponent'])){
      actions = pick(actions, ['delete']);
      appendDataComponentMenu(actions);
    }else{
      actions = pick(actions, ['delete']);
    }

    return actions;
  };
}

inherits(ETLDesignerContextPadProvider, ContextPadProvider);

ETLDesignerContextPadProvider.$inject = [
  'eventBus',
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'canvas',
  'rules',
  'translate'
];

module.exports = ETLDesignerContextPadProvider;
