'use strict';

var customEntryFactory = require('../../factory/CustomEntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

module.exports = function (group, element) {
  if (is(element, 'jsr352:Step')) {

    var options = {
      id: 'mergeOnColumns',
      label: 'merge on columns',
      modelProperty: 'mergeOnColumns',
      selectOptions: selectOptionUtil.toSelectOption(componentProvider.getColumns())
    };
    group.entries.push(customEntryFactory.multiSelectBox(options));
  }
};