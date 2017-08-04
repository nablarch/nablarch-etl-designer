var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var customEntryFactory = require('../../factory/CustomEntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'jsr352:Step')) {

    if(typeof element.businessObject.mergeOnColumns === 'string') {
      element.businessObject.mergeOnColumns = element.businessObject.mergeOnColumns.split(',');
    }

    var options = {
      id: 'mergeOnColumns',
      label: 'merge on columns',
      modelProperty: 'mergeOnColumns',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getColumns())
    };
    group.entries.push(customEntryFactory.multiSelectBox(options));
  }
};