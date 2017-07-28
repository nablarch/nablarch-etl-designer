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

modeler.importXML(initialDiagram, function(err) {
  if (err) {
    console.error('something went wrong:', err);
  }
  modeler.get('canvas').zoom('fit-viewport');
  createTempFile(initialDiagram);
});

function openDiagram(xml) {
  modeler.importXML(xml, function(err) {
    if(err){
      console.log('import error');
    }
  });
  createTempFile(initialDiagram);
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
var remote = electron.remote;
var ipc = electron.ipcRenderer;
var fs = require('fs');
var path = require('path');

var tempDir = 'bpmn-temp';
var tempName = "no-title.bpmn";

var appInfo = remote.getGlobal('appInfo');

ipc.on('main-process-new-file', function (event, args) {
  openDiagram(initialDiagram);
});

ipc.on('main-process-save-file', function (event, args) {
  saveDiagram(function (err, xml) {
    writeFile(args.fileName, xml);
    createTempFile(xml);
  });
});

ipc.on('main-process-load-file', function(event, args) {
  if(args.file){
    readFile(args.file);
  }
});

ipc.on('main-process-window-close', function(event, args){
  saveDiagram(function(err, xml){
    createTempFile(xml);
  });
  ipc.send('renderer-process-post-close');

});

ipc.on('main-process-dirty-save', function(event, args){
  saveDiagram(function (err, xml) {
    writeFile(args.fileName, xml);
  });
  if(args.isClose){
    ipc.send('renderer-process-post-close-save');
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

function createTempFile(data) {
  if(!fs.existsSync(tempDir)) {
    fs.mkdir(tempDir);
  }
  var baseName = "no-title.bpmn";
  if(appInfo.openFilePath) {
    baseName = path.basename(appInfo.openFilePath);
  }
  var tempFilePath = fs.mkdtempSync(tempDir +'/') + '/' + baseName;
  writeFile(tempFilePath, data);
  appInfo.tempFilePath = tempFilePath;
  if (appInfo.isNewFile && appInfo.openFilePath === '') {
    appInfo.openFilePath = tempFilePath;
  }
}

// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;
