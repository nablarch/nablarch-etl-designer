var jsr352ModdleDescriptor = require('../../../jsr352-js/app/descriptors/jsr352');

var elementTypes =
    [
      {
        "name": "DataComponent",
        "superClass": ["bpmn:FlowElement", "bpmn:FlowNode"]
      },
      {
        "name": "TextBox",
        "superClass": ["jsr352:DataComponent"],
        "properties": [
          {
            "name": "fontSize",
            "isAttr": true,
            "type": "String",
            "default": "12"
          }
        ]
      }
    ];

var etlProps = [
  {
    "name": "stepType",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "entities",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "bean",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "fileName",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "sqlId",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "errorEntity",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "mode",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "updateSize",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "extractBean",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "errorLimit",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "mergeOnColumns",
    "isAttr": true,
    "type": "String"
  },
  {
    "name": "insertMode",
    "isAttr": true,
    "type": "String"
  }
];

mergeEtlDescriptor(jsr352ModdleDescriptor);

module.exports = jsr352ModdleDescriptor;

function mergeEtlDescriptor(descriptor) {
  descriptor.types.map(function (element) {
    if (element.name === "Step") {
      element.properties = element.properties.concat(etlProps);
    }

  });
  descriptor.types = descriptor.types.concat(elementTypes);

}