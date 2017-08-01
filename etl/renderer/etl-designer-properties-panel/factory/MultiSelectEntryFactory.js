'use strict';

var domify = require('min-dom/lib/domify');
var domQuery = require('min-dom/lib/query');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;
var cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');

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
var multiSelect = function (options, defaultParameters) {

  var defaultSelectAction = function (element, inputNode) {
    var textBox = domQuery('input[name="' + options.modelProperty + '-text"]', inputNode);
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

  var defaultSize = options.size || 5;

  if (emptyParameter) {
    selectOptions = addEmptyParameter(selectOptions);
  }

  resource.html =
      '<div class="bpp-row bpp-element-list" >' +
      '<label for="camunda-' + resource.id + '"' +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + '>' + label + '</label>' +
      '<div class="bpp-field-wrapper">' +
      '<select id="camunda-' + modelProperty + '-select" data-action="' + selectActionName +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + '" class="multi_select" name="' + modelProperty + '-select">';

  if (isList(selectOptions)) {
    forEach(selectOptions, function (option) {
      resource.html += '<option value="' + option.value + '">' + (option.name || '') + '</option>';
    });
  }

  resource.html +=
      '</select>' +
      '<input type="text" id="camunda-' + resource.id + '" class="multi_text" ' +
      'name="' + modelProperty + '-text"' +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') + ' />' +
      '<button class="add" ' +
          'id="cam-extensionElements-create-' + resource.id + '" ' +
          'data-action="createElement">' +
          '<span>+</span>' +
          '</button>' +
      '<select id="cam-extensionElements-' + resource.id + '" ' +
          'name="' + modelProperty + '" ' +
          'size="' + defaultSize + '" ' +
          'data-list-entry-container>' +
          '</select>' +
          '<button class="clear" ' +
          'id="cam-extensionElements-remove-' + resource.id + '" ' +
          'data-action="removeElement">' +
          '<span>-</span>' +
          '</button>' +
      '</div>' +
      '</div>';

  // add description below select box entry field
  if (description && !typeof options.showCustomInput === 'function') {
    resource.html += entryFieldDescription(description);
  }

  resource[selectActionName] = selectActionMethod;
  resource.get = function(element) {
    var bo = getBusinessObject(element),
        res = {},
        prop = options.modelProperty;

    res[prop] = bo.get(prop);
    updateOptions(res[prop], domQuery('select[name="' + options.modelProperty + '"]'));
    return res;
  };

  resource.set =  function(element, values) {
    var res = {},
        prop = options.modelProperty;

    if(values.length !== 0){
      res[prop] = [];
      forEach(values, function(value){
        res[prop].push(value[prop]);
      });
    }else{
      res[prop] = undefined;
    }

    return cmdHelper.updateProperties(element, res);
  };

  resource.createElement = function(element, node){
    var textBox = domQuery('input[name="' + options.modelProperty + '-text"]');

    if( textBox.value === '' || textBox.value.trim() === '') {
      return;
    }

    if(element.businessObject[options.modelProperty]){
      for(var i = 0; i < element.businessObject[options.modelProperty].length; i++){
        if(textBox.value === element.businessObject[options.modelProperty][i]){
          return;
        }
      }
    }

    var res = {};
    var prop = options.modelProperty;

    if(!element.businessObject[prop]){
      element.businessObject[prop] = [];
    }

    res[prop] = element.businessObject[prop];
    res[prop].push(textBox.value);

    updateOptions(res[prop], domQuery('select[name="' + options.modelProperty + '"]'));

    return cmdHelper.updateProperties(element, res);
  };

  resource.removeElement = function(element, node){
    var selectBox = domQuery('select[name="' + options.modelProperty + '"]');

    if (selectBox.options.length === 0　|| selectBox.selectedIndex === -1){
      return;
    }

    var res = {};
    var prop = options.modelProperty;
    var values = element.businessObject[prop];
    var deletedIndex = -1;

    for(var i = 0; i < values.length; i++){
      if(selectBox.value === values[i]){
        values.splice(i, 1);
        deletedIndex = i;
        break;
      }
    }
    res[prop] = values;

    updateOptions(res[prop], domQuery('select[name="' + options.modelProperty + '"]'));
    selectBox.selectedIndex = i;

    return cmdHelper.updateProperties(element, res);
  };

  var updateOptions = function(selectOptions, selectBox) {
    for(var i=selectBox.options.length-1 ; i >= 0 ; i--) {
      selectBox.remove(i);
    }
    forEach(selectOptions, function (selectOption) {
      var template = domify(createOption(selectOption));
      selectBox.appendChild(template);
    })
  };

  var createOption = function(value) {
    return '<option value="' + value + '" data-name="' + options.modelProperty + '">' + value + '</option>';
  };

  if (canBeDisabled) {
    resource.isDisabled = function () {
      return !options.disabled.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['dropdown'];

  return resource;
};

module.exports = multiSelect;