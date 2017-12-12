'use strict';

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

var initialDiagram = require('../resources/initDiagram.js');

var ETLDesignerModeler = require('./etl-designer-modeler');

var propertiesPanelModule = require('bpmn-js-properties-panel'),
    propertiesProviderModule = require('./etl-designer-properties-panel/provider'),
    jsr352ModdleDescriptor = require('./descriptors'),
    camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda'),
    copypasteModule = require('./etl-designer-copypate'),
    zoomScrollModule = require('./zoom-scroll');

var modeler = new ETLDesignerModeler({
  container: '#canvas',
  keyboard: {bindTo: document},
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule,
    copypasteModule,
    zoomScrollModule
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
    ipc.send('renderer-process-change-work-bpmn');
  });
}, 500);
modeler.on('commandStack.changed', exportWorkBpmnString);

modeler.importXML(initialDiagram, function (err) {
  if (err) {
    console.error('something went wrong:', err);
  }
  modeler.get('canvas').zoom('fit-viewport');
  ipc.send('renderer-process-file-import-success', {
    bpmnString: initialDiagram,
    filepath: ''
  });
});

function saveDiagram(done) {
  modeler.saveXML({format: true}, function (err, xml) {
    done(err, xml);
  });
}

var exportEtlJson = require('./util/ExportEtlJson');
var execSync = require('child_process').execSync;

ipc.on('main-process-export-etl-files', function (event, args) {
  try {
    execSync('java -jar ' + path.join(app.getAppPath(), 'etl-designer-parser-1.0.0-jar-with-dependencies.jar') + ' ' + appInfo.openFilePath + ' ' + args.xmlPath).toString();
  } catch (e) {
    throw new Error(messageUtil.getMessage('Failed to convert the xml file.'));
  }
  try {
    var jsonObj = exportEtlJson.exportJson(appInfo.workBpmnString);
    fs.writeFileSync(args.jsonPath, JSON.stringify(jsonObj, null, '    '), 'utf8');
  } catch (e) {
    throw new Error(messageUtil.getMessage('Failed to convert the json file.\n{0}', [e.message]));
  }
  ipc.send('renderer-process-success-export-etl-files', {
    saveDirPath: args.xmlPath
  });
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
    ipc.send('renderer-process-file-import-success', {
      bpmnString: bpmnString,
      filepath: filepath
    });
  });
});

window.bpmnjs = modeler;
