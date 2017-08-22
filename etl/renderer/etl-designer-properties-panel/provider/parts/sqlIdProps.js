'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports = function(group, element) {
  if (is(element, 'jsr352:Step')) {
    group.entries.push(entryFactory.textField({
      id : 'sqlid',
      description : '',
      label : 'SQLId',
      modelProperty : 'sqlId'
    }));
  }
};