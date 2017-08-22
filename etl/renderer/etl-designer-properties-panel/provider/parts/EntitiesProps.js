'use strict';

var customEntryFactory = require('../../factory/CustomEntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'jsr352:Step')) {
    //Note: In bpmn file, 'entities' are stored as one string. so it is necessary to split as array at once.
    if(typeof element.businessObject.entities === 'string') {
      element.businessObject.entities = element.businessObject.entities.split(',');
    }

    var options = {
      id: 'entities',
      label: 'truncate entity',
      modelProperty: 'entities',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getEntities())
    };
    group.entries.push(customEntryFactory.multiSelectBox(options));
  }
};