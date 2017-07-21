var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var customEntryFactory = require('../../factory/CustomEntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'jsr352:Step')) {
    var options = {
      id: 'entities',
      label: 'truncate entity',
      modelProperty: 'entities',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getEntities())
    };
    // group.entries.push(entryFactory.selectBox(options));
    group.entries.push(customEntryFactory.multiSelectBox(options));

  }
};