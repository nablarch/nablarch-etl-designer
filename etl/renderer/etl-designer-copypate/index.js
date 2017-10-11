var copypasteModule = require('./EtlDesignerCopyPaste');

var appendProperties = [
  'fontSize',
  'stepType',
  'entities',
  'bean',
  'fileName',
  'sqlId',
  'errorEntity',
  'mode',
  'updateSize',
  'extractBean',
  'errorLimit',
  'mergeOnColumns',
  'insertMode'
];

copypasteModule.appendCopiedProperties(appendProperties);
copypasteModule.appendPastedProperties(appendProperties);
copypasteModule.appendRemovedProperties(appendProperties);

module.exports = {
  __depends__: [
    require('bpmn-js/lib/features/copy-paste')
  ],
  __init__: ['bpmnCopyPaste'],
  bpmnCopyPaste: ['type', copypasteModule]
};
