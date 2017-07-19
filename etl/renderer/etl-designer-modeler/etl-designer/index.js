module.exports = {
  __init__: [ 'customRenderer', 'paletteProvider', 'bpmnRules', 'customUpdater', 'contextPadProvider' ],
  elementFactory: [ 'type', require('../../../../jsr352-js/app/jsr352-modeler/jsr352/JSR352ElementFactory') ],
  customRenderer: [ 'type', require('./EtlDesignerRenderer') ],
  paletteProvider: [ 'type', require('./EtlDesignerPalette') ],
  bpmnRules: [ 'type', require('./EtlDesignerRules') ],
  customUpdater: [ 'type', require('./EtlDesignerUpdater') ],
  contextPadProvider: [ 'type', require('./EtlDesignerContextPadProvider') ]
};
