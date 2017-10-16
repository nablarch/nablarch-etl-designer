var copypasteModule = require('../../../jsr352-js/app/copy-paste/JSR352CopyPaste');

var appendProperties = [
  'on',
  'exit-status',
  'restart',
  'start-limit',
  'allow-start-if-complete',
  'checkpoint-policy',
  'item-count',
  'time-limit',
  'skip-limit',
  'retry-limit',
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
