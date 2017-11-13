'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var is = require('bpmn-js/lib/util/ModelUtil').is;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

module.exports = function(group, element) {
  if (is(element, 'jsr352:Step')) {
    group.entries.push(entryFactory.validationAwareTextField({
      id : 'errorLimit',
      description : '',
      label : 'error limit',
      modelProperty : 'errorLimit',
      getProperty: function(element) {
        return getBusinessObject(element)['errorLimit'];
      },
      setProperty: function(element, properties) {
        return cmdHelper.updateProperties(element, properties);
      },
      validate: function(element, values) {
        var isValid;
        if(values['errorLimit']){
          isValid = /^[0-9]+$/.test(values['errorLimit']);
        }else if(typeof values['errorLimit'] === 'undefined'){
          isValid = true;
        }

        return isValid ? {} : {'errorLimit': 'Must be integer'};
      }
    }));
  }
};