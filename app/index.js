'use strict';

var BpmnModeler = require('bpmn-js/lib/Modeler');

var propertiesPanelModule = require('bpmn-js-properties-panel');
var propertiesProviderModule = require('bpmn-js-properties-panel/lib/provider/camunda');
var camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda');

var bpmnModeler = new BpmnModeler({
  container: '#js-canvas',
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule
  ],
  moddleExtensions: {
    camunda: camundaModdleDescriptor
  }
});

bpmnModeler.createDiagram();