'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

// input entities
var comboBox = require('./ComboBoxEntryFactory');
var multiSelect = require('./MultiSelectEntryFactory');

var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

// helpers ////////////////////////////////////////

function ensureNotNull(prop) {
  if (!prop) {
    throw new Error(prop + ' must be set.');
  }

  return prop;
}

/**
 * sets the default parameters which are needed to create an entry
 *
 * @param options
 * @returns {{id: *, description: (*|string), get: (*|Function), set: (*|Function),
 *            validate: (*|Function), html: string}}
 */
var setDefaultParameters = function( options ) {

  // default method to fetch the current value of the input field
  var defaultGet = function(element) {
    var bo = getBusinessObject(element),
        res = {},
        prop = ensureNotNull(options.modelProperty);
    res[prop] = bo.get(prop);

    return res;
  };

// default method to set a new value to the input field
  var defaultSet = function(element, values) {
    var res = {},
        prop = ensureNotNull(options.modelProperty);
    if (values[prop] !== '') {
      res[prop] = values[prop];
    } else {
      res[prop] = undefined;
    }

    return cmdHelper.updateProperties(element, res);
  };

// default validation method
  var defaultValidate = function() {
    return {};
  };

  return {
    id : options.id,
    description : ( options.description || '' ),
    get : ( options.get || defaultGet ),
    set : ( options.set || defaultSet ),
    validate : ( options.validate || defaultValidate ),
    html: ''
  };
};

function CustomEntryFactory() {
}

CustomEntryFactory.comboBox = function(options) {
  return comboBox(options, setDefaultParameters(options));
};

CustomEntryFactory.multiSelectBox = function(options) {
  return multiSelect(options, setDefaultParameters(options));
};

module.exports = CustomEntryFactory;
