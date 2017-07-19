'use strict';

var initialDiagram =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
    'xmlns:jsr352="http://jsr352/" ' +
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
    'id="Definitions_1">' +
    '<jsr352:Job id="Job_1" isExecutable="false">' +
    '<jsr352:Start id="Start_1"/>' +
    '</jsr352:Job>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
    '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Job_1">' +
    '<bpmndi:BPMNShape id="_BPMNShape_Start_2" bpmnElement="Start_1">' +
    '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
    '</bpmndi:BPMNShape>' +
    '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
    '</bpmn:definitions>';

var ETLDesignerModeler = require('./etl-designer-modeler');
// var $ = require('jquery');

var propertiesPanelModule = require('bpmn-js-properties-panel'),
    propertiesProviderModule = require('./etl-designer-properties-panel/provider'),
    jsr352ModdleDescriptor = require('./descriptors'),
    camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda'),
    // minimapModule = require('./diagram-js-minimap');
    copypasteModule = require('./etl-designer-copypate');


var modeler = new ETLDesignerModeler({
  container: '#canvas',
  keyboard: { bindTo: document },
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule,
    // minimapModule
    copypasteModule
  ],
  moddleExtensions: {
    jsr352: jsr352ModdleDescriptor,
    camunda: camundaModdleDescriptor
  }
});

modeler.importXML(initialDiagram, function(err) {
  if (err) {
    console.error('something went wrong:', err);
  }
  modeler.get('canvas').zoom('fit-viewport');
});

function openDiagram(xml) {
  modeler.importXML(xml, function(err) {
    if(err){
      console.log('import error');
    }
  });
}

function saveSVG(done) {
  modeler.saveSVG(done);
}

function saveDiagram(done) {
  modeler.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

var electron = window.require('electron');
var ipc = electron.ipcRenderer;
var fs = require('fs');

ipc.on('main-process-save-file', function (event, args) {
  saveDiagram(function (err, xml) {
    writeFile(args.filename, xml);
  });
});

ipc.on('main-process-load-file', function(event, args) {
  if(args.file){
    readFile(args.file);
  }
});

function writeFile(path, data){
  fs.writeFile(path, data, function (err) {
    if (err !== null) {
      throw err;
    }
  });
}

function readFile(path) {
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) {
      throw err;
    }

    openDiagram(data);
  });
}

// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;
