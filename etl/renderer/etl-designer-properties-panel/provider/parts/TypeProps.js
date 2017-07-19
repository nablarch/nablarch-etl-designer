var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');


var typeProps = function(group, element, bpmnFactory) {
  if (is(element, 'jsr352:Step')) {
    var elementTypeEntry = entryFactory.selectBox({
      id : 'stepType',
      label : 'Step type',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getStepType()),
      modelProperty : 'stepType'
    });

    group.entries.push(elementTypeEntry);
  }
};

module.exports = typeProps;