'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

module.exports = function(group, element, bpmnFactory) {
  if(isAny(element, ['jsr352:File', 'jsr352:TextBox', 'jsr352:Database'])){
    group.entries.push(entryFactory.validationAwareTextField({
      id: 'fontSize',
      description:'',
      label: 'font-size',
      modelProperty: 'fontSize',
      getProperty: function(element) {
        return getBusinessObject(element)['fontSize'];
      },
      setProperty: function(element, properties) {
        return cmdHelper.updateProperties(element, properties);
      },
      validate: function(element, values) {
        var isValid = /^[0-9]+$/.test(values['fontSize']);
        return isValid ? {} : {'font-size': 'Must be integer'};
      }
    }));
  }
};