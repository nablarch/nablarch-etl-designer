'use strict';

var domQuery = require('min-dom/lib/query');
var forEach = require('lodash/collection/forEach');

var entryFieldDescription = require('bpmn-js-properties-panel/lib/factory/EntryFieldDescription');

var isList = function (list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

var addEmptyParameter = function (list) {
  return list.concat([{name: '', value: ''}]);
};

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.label]
 * @param  {Array<Object>} options.selectOptions
 * @param  {string} options.modelProperty
 * @param  {boolean} options.emptyParameter
 * @param  {function} options.disabled
 * @param  {string} options.description
 * @param  {Object} defaultParameters
 * @param  {string} options.dataValueLabel
 * @param  {Object} options.textAction
 * @param  {Object} options.selectAction
 *
 * @return {Object}
 */
var comboBox = function (options, defaultParameters) {
  var defaultSelectAction = function (element, inputNode) {
    var textBox = domQuery('input[name="' + options.modelProperty + '"]', inputNode);
    var selectBox = domQuery('select[id="camunda-' + options.modelProperty + '-select"]', inputNode);
    if (selectBox.value !== '') {
      textBox.value = selectBox.value;
      selectBox.value = '';
    }
    return true;
  };

  var resource = defaultParameters,
      label = options.label || resource.id,
      selectOptions = options.selectOptions || [{name: '', value: ''}],
      modelProperty = options.modelProperty,
      emptyParameter = options.emptyParameter,
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function',
      description = options.description,
      selectActionName = ( typeof options.selectAction !== 'undefined' ) ? options.selectAction.name : 'select',
      selectActionMethod = ( typeof options.selectAction !== 'undefined' ) ? options.selectAction.method : defaultSelectAction;

  if (emptyParameter) {
    selectOptions = addEmptyParameter(selectOptions);
  }

  var inputHtml =
      '<input type="text" id="camunda-' + resource.id + '" name="' + modelProperty + '" class="combo_text"' +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + ' />';

  resource.html =
      '<label for="camunda-' + resource.id + '"' +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + '>' + label + '</label>';

  resource.html += '<select id="camunda-' + modelProperty + '-select" data-action="' + selectActionName +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + '" class="combo_select" name="' + modelProperty + '-select">';

  if (isList(selectOptions)) {
    forEach(selectOptions, function (option) {
      resource.html += '<option value="' + option.value + '">' + (option.name || '') + '</option>';
    });
  }
  resource.html += '</select>' + inputHtml;

  // add description below select box entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  resource[selectActionName] = selectActionMethod;

  if (canBeDisabled) {
    resource.isDisabled = function () {
      return !options.disabled.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['dropdown'];

  return resource;
};

module.exports = comboBox;
