var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element) {
  if (is(element, 'jsr352:Step')) {
    group.entries.push(entryFactory.selectBox({
      id : 'mode',
      label : 'mode',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getMode()),
      modelProperty : 'mode'
    }));
  }
};