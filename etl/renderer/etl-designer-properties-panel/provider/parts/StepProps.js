'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
    cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var componentProvider = require('../../../util/EtlDesignerComponentProvider');
var selectOptionUtil = require('../../../../../jsr352-js/app/util/SelectOptionUtil');

var customEntryFactory = require('../../factory/CustomEntryFactory');

function chunkChildEntry(element, bpmnFactory, id) {
  var typeName = id.replace(/\b\w/g, function(l){ return l.toUpperCase() });
  var entry = entryFactory.textBox({
    id : id,
    description : 'Specifies the name of a ' + id + ' artifact.',
    label : typeName,
    modelProperty : id
  });

  entry.get = function() {
    var chunk = getBusinessObject(element).chunk;
    var props = {};
    props[id] = chunk[id] ? chunk[id].ref : '';
    return props;
  };

  entry.set = function(element, values) {
    var chunk = getBusinessObject(element).chunk;
    if (values[id]) {
      var newProperties = {};
      newProperties[id] = bpmnFactory.create('jsr352:' + typeName, {ref: values[id]});
      return cmdHelper.updateBusinessObject(chunk, getBusinessObject(chunk), newProperties);
    }
  };

  return entry;
}

module.exports = function(group, element, bpmnFactory) {
  if (is(element, 'jsr352:Step')) {
    group.entries.push(entryFactory.validationAwareTextField({
      id : 'start-limit',
      description : 'Specifies the number of times this step may be started or restarted. It must be a valid XML integer value',
      label : 'Start Limit',
      modelProperty : 'start-limit',
      getProperty: function(element) {
        return getBusinessObject(element)['start-limit'];
      },
      setProperty: function(element, properties) {
        return cmdHelper.updateProperties(element, properties);
      },
      validate: function(element, values) {
        var isValid = /^[0-9]+$/.test(values['start-limit']);
        return isValid ? {} : {'start-limit': 'Must be integer'};
      }
    }));

    group.entries.push(entryFactory.checkbox({
      id : 'allow-start-if-complete',
      description : 'Specifies whether this step is allowed to start during job restart, even if the step completed in a previous execution. ',
      label : 'Allow start if complete',
      modelProperty : 'allow-start-if-complete',
      getProperty: function(element) {
        return getBusinessObject(element)['allow-start-if-complete'];
      },
      setProperty: function(element, properties) {
        return cmdHelper.updateProperties(element, properties);
      }
    }));
  }

  if (is(element, 'jsr352:Batchlet')) {
    group.entries.push(customEntryFactory.comboBox({
      id : 'ref',
      description : 'Specifies the name of a batch artifact.',
      label : 'Ref',
      modelProperty : 'ref',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getBatchlets())
    }));
  }

  if (is(element, 'jsr352:Reader')) {
    group.entries.push(customEntryFactory.comboBox({
      id : 'ref',
      description : 'Specifies the name of a batch artifact.',
      label : 'Ref',
      modelProperty : 'ref',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getItemReaders())
    }));
  }

  if (is(element, 'jsr352:Writer')) {
    group.entries.push(customEntryFactory.comboBox({
      id : 'ref',
      description : 'Specifies the name of a batch artifact.',
      label : 'Ref',
      modelProperty : 'ref',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getItemWriters())
    }));
  }

  if (is(element, 'jsr352:Processor')) {
    group.entries.push(customEntryFactory.comboBox({
      id : 'ref',
      description : 'Specifies the name of a batch artifact.',
      label : 'Ref',
      modelProperty : 'ref',
      selectOptions : selectOptionUtil.toSelectOption(componentProvider.getItemProcessors())
    }));
  }

  if (is(element, 'jsr352:Chunk')) {
    group.entries.push(entryFactory.selectBox({
      id: 'checkpoint-policy',
      description: 'Specifies the checkpoint policy that governs commit behavior for this chunk.',
      label: 'Checkpoint Policy',
      modelProperty: 'checkpoint-policy',
      selectOptions: [
        {name: 'item', value: 'item'},
        {name: 'custom', value: 'custom'}
      ]
    }));

    group.entries.push(entryFactory.validationAwareTextField({
      id: 'item-count',
      description: 'Specifies the number of items to process per chunk when using the item checkpoint policy. ',
      label: 'Item count',
      modelProperty: 'item-count',
      getProperty: function(element) {
        return getBusinessObject(element)['item-count'];
      },
      setProperty: function(element, properties) {
        var bo = getBusinessObject(element);
        if (properties['item-count']) {
          properties['item-count'] = parseInt(properties['item-count']);
          return cmdHelper.updateBusinessObject(element, bo, properties);
        }
      },
      validate: function(element, values) {
        var isValid = /^[0-9]+$/.test(values['item-count']);
        return isValid ? {} : {'item-count': 'Must be integer'};
      }
    }));
  }
};
