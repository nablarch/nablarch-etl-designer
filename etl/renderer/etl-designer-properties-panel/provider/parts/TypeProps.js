'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

var typeProps = function (group, element) {
  if (is(element, 'jsr352:Step')) {
    group.entries.push(entryFactory.selectBox({
      id: 'stepType',
      label: 'Step type',
      modelProperty: 'stepType',
      selectOptions: selectOptionUtil.toSelectOption(componentProvider.getStepType())
    }));
  }
};

module.exports = typeProps;