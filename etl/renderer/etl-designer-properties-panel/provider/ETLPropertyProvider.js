'use strict';

var inherits = require('inherits');
var is = require('bpmn-js/lib/util/ModelUtil').is;
var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var configFileUtil = require('../../util/ConfigFileUtil');

var PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');

var stepProps = require('./parts/StepProps'),
    listenerProps = require('./parts/ListenerProps'),
    nameProps = require('../../../../jsr352-js/app/jsr352-properties-panel/provider/parts/NameProps'),
    restartableProps = require('../../../../jsr352-js/app/jsr352-properties-panel/provider/parts/RestartableProps'),
    transitionProps = require('../../../../jsr352-js/app/jsr352-properties-panel/provider/parts/TransitionProps'),
    properties = require('bpmn-js-properties-panel/lib/provider/camunda/parts/PropertiesProps'),
    documentationProps = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps'),
    restartProps = require('../../../../jsr352-js/app/jsr352-properties-panel/provider/parts/RestartProps');

var typeProps = require('./parts/TypeProps'),
    entitiesProps = require('./parts/EntitiesProps'),
    beanProps = require('./parts/BeanProps'),
    fileNameProps = require('./parts/FileNameProps'),
    sqlIdProps = require('./parts/sqlIdProps'),
    errorEntityProps = require('./parts/ErrorEntityProps'),
    modeProps = require('./parts/ModeProps'),
    extractBeanProps = require('./parts/ExtractBeanProps'),
    updateSizeProps = require('./parts/UpdateSizeProps'),
    fontSizeProps = require('./parts/FontSizeProps'),
    errorLimitProps = require('./parts/ErrorLimitProprs'),
    mergeOnColumnsProps = require('./parts/MergeOnColumnsProps'),
    insertModeProps = require('./parts/InsertModeProp');

var stepTypeList = configFileUtil.getProperties().stepType || {};

function createEtlPropertiesByStepTypeTabGroup(element, bpmnFactory) {
  var propertyGroupsByStepType = [];

  var stepTypeGroup = {
    id: 'stepType',
    label: 'Step Type Select',
    entries: [],
    enabled: function (element) {
      return is(element, 'jsr352:Step');
    }
  };
  propertyGroupsByStepType.push(stepTypeGroup);
  typeProps(stepTypeGroup, element, bpmnFactory);

  return propertyGroupsByStepType.concat(createInputGroups(stepTypeList, element, bpmnFactory));

}

function createInputGroups(stepTypeList, element, bpmnFactory) {
  var groups = [];

  for (var key in stepTypeList) {
    if (!stepTypeList.hasOwnProperty(key)) {
      continue;
    }
    var propertyNameList = stepTypeList[key];

    var group = {
      id: key,
      label: key,
      entries: [],
      enabled: function (element) {
        return is(element, 'jsr352:Step') && (this.id === element.businessObject.stepType);
      }
    };

    groups.push(group);
    for (var index in propertyNameList) {
      if (!propertyNameList.hasOwnProperty(index)) {
        continue;
      }
      switch (propertyNameList[index]) {
        case 'entities':
          entitiesProps(group, element, bpmnFactory);
          break;
        case 'bean':
          beanProps(group, element);
          break;
        case 'errorEntity':
          errorEntityProps(group, element);
          break;
        case 'mode':
          modeProps(group, element);
          break;
        case 'fileName':
          fileNameProps(group, element);
          break;
        case 'sqlId':
          sqlIdProps(group, element);
          break;
        case 'extractBean':
          extractBeanProps(group, element);
          break;
        case 'updateSize':
          updateSizeProps(group, element);
          break;
        case 'errorLimit':
          errorLimitProps(group, element);
          break;
        case 'mergeOnColumns':
          mergeOnColumnsProps(group, element);
          break;
        case 'insertMode':
          insertModeProps(group, element);
          break;
        default:
          break;
      }
    }
  }

  return groups;
}

function createGeneralTabGroups(element, bpmnFactory) {
  var generalGroup = {
    id: 'general',
    label: 'General',
    entries: []
  };
  if (isAny(element, ['jsr352:BatchComponent', 'jsr352:Job'])) {
    nameProps(generalGroup, element);
  }
  stepProps(generalGroup, element, bpmnFactory);
  listenerProps(generalGroup, element, bpmnFactory);
  transitionProps(generalGroup, element);
  restartableProps(generalGroup, element);
  restartProps(generalGroup, element);

  var documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory);

  return [
    generalGroup,
    documentationGroup
  ];
}

function createExtensionElementsGroups(element, bpmnFactory) {
  var propertiesGroup = {
    id: 'extensionElements-properties',
    label: 'Properties',
    entries: [],
    enabled: function (element) {
      return isAny(element, ['jsr352:Job', 'jsr352:Step', 'jsr352:Listener', 'jsr352:Batchlet', 'jsr352:Reader', 'jsr352:Processor', 'jsr352:Writer']);
    }
  };
  properties(propertiesGroup, element, bpmnFactory);

  return [
    propertiesGroup
  ];
}

function createTextTabGroups(element, bpmnFactory) {
  var textTabGroup = {
    id: 'textAnnotation',
    label: 'text annotation',
    entries: [],
    enabled: function (element) {
      return is(element, 'jsr352:TextBox');
    }
  };
  fontSizeProps(textTabGroup, element, bpmnFactory);

  return [
    textTabGroup
  ];
}

function ETLPropertiesProvider(eventBus, bpmnFactory, elementRegistry) {
  PropertiesActivator.call(this, eventBus);

  this.getTabs = function (element) {

    var tabs = [];

    var generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry)
    };

    var extensionsTab = {
      id: 'PropertyElements',
      label: 'Properties',
      groups: createExtensionElementsGroups(element, bpmnFactory, elementRegistry)
    };

    var etlPropertyTab = {
      id: 'etlproperties',
      label: 'ETL Properties',
      groups: createEtlPropertiesByStepTypeTabGroup(element, bpmnFactory, elementRegistry)
    };

    var textPropertyTab = {
      id: 'general',
      label: 'Properties',
      groups: createTextTabGroups(element, bpmnFactory, elementRegistry)
    };

    if (is(element, 'jsr352:BatchComponent')) {
      tabs.push(generalTab);
      tabs.push(extensionsTab);
      tabs.push(etlPropertyTab);
    } else if (is(element, 'jsr352:DataComponent')) {
      tabs.push(textPropertyTab);
    } else {
      tabs.push(generalTab);
      tabs.push(extensionsTab);
    }

    return tabs;
  };
}

inherits(ETLPropertiesProvider, PropertiesActivator);

module.exports = ETLPropertiesProvider;