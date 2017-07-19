module.exports = {
  __depends__: [
    require('bpmn-js/lib/features/copy-paste')
  ],
  __init__: [ 'bpmnCopyPaste' ],
  bpmnCopyPaste: [ 'type', require('./EtlDesignerCopyPaste') ]
};
