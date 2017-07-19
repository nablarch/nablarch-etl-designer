'use strict';

var domify = require('min-dom/lib/domify');
var domQuery = require('min-dom/lib/query');

var forEach = require('lodash/collection/forEach');

var entryFieldDescription = require('bpmn-js-properties-panel/lib/factory/EntryFieldDescription');


var isList = function(list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

var addEmptyParameter = function(list) {
  return list.concat([ { name: '', value: '' } ]);
};

var createOption = function(option) {
  return '<option value="' + option.value + '">' + option.name + '</option>';
};

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.label]
 * @param  {Array<Object>} options.selectOptions
 * @param  {string} options.modelProperty
 * @param  {boolean} options.emptyParameter
 * @param  {function} options.disabled
 * @param  {Object} defaultParameters
 *
 * @return {Object}
 */
var datalistTextbox = function(options, defaultParameters) {

  var defaultButtonAction = function(element, inputNode) {
    var input = domQuery('input[name="' + options.modelProperty + '"]', inputNode);
    // input.value = 'aaa';
    console.log(input);
    console.log(input.value);

    return true;
  };

  // default method to determine if the button should be visible
  var defaultButtonShow = function(element, inputNode) {
    var input = domQuery('input[name="' + options.modelProperty + '"]', inputNode);

    return input.value !== '';
  };

  var resource = defaultParameters,
      label = options.label || resource.id,
      selectOptions = options.selectOptions || [ { name: '', value: '' } ],
      modelProperty = options.modelProperty,
      emptyParameter = options.emptyParameter,
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      actionName     = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.name : 'clear',
      actionMethod   = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.method : defaultButtonAction,
      showName       = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.name : 'canClear',
      showMethod     = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.method : defaultButtonShow,
      description    = options.description;


  if (emptyParameter) {
    selectOptions = addEmptyParameter(selectOptions);
  }

  resource.html =
      '<label for="camunda-' + resource.id + '"' +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + '>' + label + '</label>' +
      '<form class="bpp-field-wrapper">' +
      '<input type="text" id="camunda-' + resource.id + '" name="' + modelProperty + '"' +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + '  list="combolist" ' +
      'onblur="' + actionName + '">' +
      // '<button class="' + actionName + '" data-action="' + actionName + '" data-show="' + showName + '" ' +
      // (canBeDisabled ? 'data-disabled="isDisabled"' : '') + '>' +
      // '<span>' + buttonLabel + '</span>' +
      // '</button>' +
      '</form>';

  if (isList(selectOptions)) {
    resource.html += '<datalist id="combolist">';
    forEach(selectOptions, function(option) {
      resource.html += '<option value="' + option.value + '">' + (option.name || '') + '</option>';
    });
    resource.html += '</datalist>';
  }

  resource[actionName] = actionMethod;
  resource[showName] = showMethod;


  // add description below select box entry field
  if (description && !typeof options.showCustomInput === 'function') {
    resource.html += entryFieldDescription(description);
  }

  if (canBeDisabled) {
    resource.isDisabled = function() {
      return !options.disabled.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['dropdown'];

  return resource;
};

module.exports = datalistTextbox;
