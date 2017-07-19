var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function(group, element) {
  if (is(element, 'jsr352:Step')) {
    var options = {
      id : 'errorEntity',
      label : 'errorEntity',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getErrorEntities()),
      modelProperty : 'errorEntity'
    };
    group.entries.push(entryFactory.selectBox(options));
  }
};