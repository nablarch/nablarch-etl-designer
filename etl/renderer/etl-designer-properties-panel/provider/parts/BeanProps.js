var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var customEntryFactory = require('../../factory/CustomEntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;
var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element) {
  if (is(element, 'jsr352:Step')) {
    // componentProvider.readConfigFile();

    var options = {
      id : 'bean',
      label : 'bean',
      modelProperty : 'bean',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getBean())
    };
    group.entries.push(entryFactory.selectBox(options));
    // group.entries.push(customEntryFactory.dataListTextBox(options));
  }
};