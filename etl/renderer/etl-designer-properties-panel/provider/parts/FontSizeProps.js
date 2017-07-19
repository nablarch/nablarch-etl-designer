'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var is = require('bpmn-js/lib/util/ModelUtil').is;
var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element, bpmnFactory) {
  if(isAny(element, ['jsr352:File', 'jsr352:TextBox', 'jsr352:Database'])){
    group.entries.push(entryFactory.validationAwareTextField({
      id: 'fontSize',
      description:'',
      label: 'font-size',
      modelProperty: 'fontSize',
      // selectOptions: selectOptionUtil.toSelectOption(componentProvider.getFontSize()),
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