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

window.onerror = function (message, url, line, col, err) {
  var errData = {
    message: message,
    url: url,
    line: line,
    col: col,
    err: err
  };
  ipc.send('main-handle-error', errData);
};

var electron = window.require('electron');
var remote = electron.remote;
var ipc = electron.ipcRenderer;
var app = remote.app;

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var appInfo = remote.getGlobal('appInfo');
var configFileUtil = require('./util/ConfigFileUtil');
var messageUtil = require('./util/MessageUtil');

var registryFilePath = appInfo.argDev ? app.getAppPath() : path.join(app.getPath('exe'), '../');
configFileUtil.init(registryFilePath, app.getPath('userData'));
messageUtil.setLocale(configFileUtil.getLocale());

var ETLDesignerModeler = require('./etl-designer-modeler');

var propertiesPanelModule = require('bpmn-js-properties-panel'),
    propertiesProviderModule = require('./etl-designer-properties-panel/provider'),
    jsr352ModdleDescriptor = require('./descriptors'),
    camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda'),
    // minimapModule = require('./diagram-js-minimap');
    copypasteModule = require('./etl-designer-copypate');

var modeler = new ETLDesignerModeler({
  container: '#canvas',
  keyboard: {bindTo: document},
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
    var parser = new DOMParser();
    var bpmnDom = parser.parseFromString(xml, "text/xml");
    var jobElements = bpmnDom.getElementsByTagName('job');
    appInfo.jobName = jobElements[0].getAttribute('bpmn:name');
    appInfo.workBpmnString = xml;
  });
}, 500);
modeler.on('commandStack.changed', exportWorkBpmnString);

modeler.importXML(initialDiagram, function (err) {
  if (err) {
    console.error('something went wrong:', err);
  }
  modeler.get('canvas').zoom('fit-viewport');
  appInfo.workBpmnString = initialDiagram;
});

function saveDiagram(done) {
  modeler.saveXML({format: true}, function (err, xml) {
    done(err, xml);
  });
}

var exportEtlJson = require('./util/ExportEtlJson');
var exportJobXml = require('./util/ExportJobXml');
var jobNameCheck = require('./util/check/JobNameCheck');

ipc.on('main-process-pre-export-etl-files', function () {
  var bpmnXmlString = appInfo.workBpmnString;
  var parser = new DOMParser();
  var bpmnDom = parser.parseFromString(bpmnXmlString, "text/xml");
  var validationResult = jobNameCheck(bpmnDom);
  var message;
  if (validationResult.length > 0) {
    message = messageUtil.getMessage('Job name attribute must be set.');
  }

  ipc.send('renderer-process-checked-job-name', {
    message: message
  });
});

ipc.on('main-process-export-etl-files', function (event, args) {
  try {
    var xmlString = exportJobXml.exportXml(appInfo.workBpmnString);
    fs.writeFileSync(args.xmlPath, xmlString, 'utf8');
  } catch (e) {
    throw new Error(messageUtil.getMessage('Failed to convert the xml file.\n{0}', [e.message]));
  }
  try {
    var jsonObj = exportEtlJson.exportJson(appInfo.workBpmnString);
    fs.writeFileSync(args.jsonPath, JSON.stringify(jsonObj, null, '    '), 'utf8');
  } catch (e) {
    throw new Error(messageUtil.getMessage('Failed to convert the json file.\n{0}', [e.message]));
  }
  alert(messageUtil.getMessage('Export is finished successfully.'));
});

ipc.on('main-process-import-bpmn-file', function (event, args) {
  var bpmnString = args.bpmnString || initialDiagram;
  var filepath = args.filepath || '';
  modeler.importXML(bpmnString, function (err) {
    if (err) {
      console.log('import error');
      console.log(err);
      throw new Error(messageUtil.getMessage('Failed to load a bpmn file.\n{0}', [err.message]));
    }
    appInfo.workBpmnString = bpmnString;
    appInfo.openFilePath = filepath;
    document.title = messageUtil.getMessage('ETL Designer - [{0}]', [filepath]);
  });
});

window.bpmnjs = modeler;
