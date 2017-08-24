'use strict';

var initialDiagram =
'<?xml version="1.0" encoding="UTF-8"?>\n\
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:jsr352="http://jsr352/" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n\
  <jsr352:job id="Job_1" isExecutable="false">\n\
    <jsr352:start id="Start_1" />\n\
  </jsr352:job>\n\
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n\
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Job_1">\n\
      <bpmndi:BPMNShape id="_BPMNShape_Start_2" bpmnElement="Start_1">\n\
        <dc:Bounds x="173" y="102" width="36" height="36" />\n\
      </bpmndi:BPMNShape>\n\
    </bpmndi:BPMNPlane>\n\
  </bpmndi:BPMNDiagram>\n\
</bpmn:definitions>\n';


var electron = window.require('electron');
var remote = electron.remote;
var ipc = electron.ipcRenderer;

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var appInfo = remote.getGlobal('appInfo');
var messageUtil = require('./util/MessageUtil');

var ETLDesignerModeler = require('./etl-designer-modeler');

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

var exportWorkBpmnString = _.debounce(function () {
  saveDiagram(function (err, xml) {
    appInfo.workBpmnString = xml;
  });
}, 500);

modeler.on('commandStack.changed', exportWorkBpmnString);

modeler.importXML(initialDiagram, function(err) {
  if (err) {
    console.error('something went wrong:', err);
  }
  modeler.get('canvas').zoom('fit-viewport');
  appInfo.workBpmnString = initialDiagram;
});

function openDiagram(xml) {
  modeler.importXML(xml, function(err) {
    if(err){
      console.log('import error');
    }
    appInfo.workBpmnString = xml;
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

var exportEtlJson = require('./util/ExportEtlJson');
var exportJobXml = require('./util/ExportJobXml');
var jobNameCheck = require('./util/check/JobNameCheck');

ipc.on('main-process-pre-export-etl-files', function(event, args){
  var validationResult = jobNameCheck();
  var message;
  if(validationResult.length > 0){
    message = messageUtil.getMessage('Job name attribute must be set.', appInfo.locale);
  }

  ipc.send('renderer-process-checked-job-name', {
    message: message
  });
});

ipc.on('main-process-export-etl-files', function(event, args) {
  try {
    exportJobXml.exportXml(appInfo.workBpmnString, args.xmlPath);
  } catch (e) {
    throw new Error(messageUtil.getMessage('Failed to convert the xml file.\n{0}', appInfo.locale, [e.message]));
  }
  try {
    exportEtlJson.exportJson(appInfo.workBpmnString, args.jsonPath);
  } catch (e) {
    throw new Error(messageUtil.getMessage('Failed to convert the json file.\n{0}', appInfo.locale, [e.message]));
  }
  alert(messageUtil.getMessage('Export is finished successfully.', appInfo.locale));
});


ipc.on('main-process-import-bpmn-file', function (event, args) {
  var bpmnString = args.bpmnString || initialDiagram;
  modeler.importXML(bpmnString, function(err) {
    if(err){
      console.log('import error');
      console.log(err);
      throw new Error(messageUtil.getMessage('Failed to load a bpmn file.\n{0}', appInfo.locale, [e.message]));
    }
    appInfo.workBpmnString = bpmnString;
  });
});

window.onerror = function(message, url, line, colno, err) {
  var errData = {
    message: message,
    url: url,
    line: line,
    colno: colno,
    err: err
  };
  ipc.send('main-handle-error', errData);
};

// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;
