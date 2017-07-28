'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

var customEntryFactory = require('../../factory/CustomEntryFactory');

module.exports = function (group, element, bpmnFactory) {
  if (is(element, 'jsr352:Listener')) {
    group.entries.push(customEntryFactory.comboBox({
      id: 'ref',
      description: 'Specifies the name of a batch artifact',
      label: 'Ref',
      modelProperty: 'ref',
      selectOptions: selectOptionUtil.toSelectOption(componentProvider.getListeners())
    }));

  }
};
