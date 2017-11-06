'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var is = require('bpmn-js/lib/util/ModelUtil').is;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

module.exports = function(group, element) {
  if (is(element, 'jsr352:Step')) {
    group.entries.push(entryFactory.validationAwareTextField({
      id : 'updateSize',
      description : '',
      label : 'commit interval',
      modelProperty : 'updateSize',
      getProperty: function(element) {
        return getBusinessObject(element)['updateSize'];
      },
      setProperty: function(element, properties) {
        return cmdHelper.updateProperties(element, properties);
      },
      validate: function(element, values) {
        var isValid;
        if(values['updateSize']){
          isValid = /^[0-9]+$/.test(values['updateSize']);
        }else if(typeof values['updateSize'] === 'undefined'){
          isValid = true;
        }

        return isValid ? {} : {'updateSize': 'Must be integer'};
      }
    }));
  }
};