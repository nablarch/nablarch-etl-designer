var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var customEntryFactory = require('../../factory/CustomEntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element) {
  if (is(element, 'jsr352:Step')) {
    group.entries.push(entryFactory.textField({
      id : 'updateSizeSize',
      description : '',
      label : 'commit interval',
      modelProperty : 'updateSizeSize'
    }));
    group.entries.push(customEntryFactory.comboBox({
      id : 'updateSizeBean',
      label : 'extract bean',
      modelProperty : 'updateSizeBean',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getBean())
    }));
  }
};