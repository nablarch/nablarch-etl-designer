'use strict';

var self = checkUtil;

function checkUtil() {
}

checkUtil.errorTypes = {
  error: 'error',
  warning: 'warning'
};

checkUtil.createValidationInfo = function (element, message, errorType) {
  return {
    id: element.getAttribute('id'),
    name: element.getAttribute('name'),
    elementType: self.getTagName(element),
    message: message,
    errorType: errorType
  };
};

checkUtil.isInteger = function (value) {
  return typeof value === 'number' &&
      isFinite(value) &&
      Math.floor(value) === value;
};

checkUtil.getTagName = function (element) {
  var tagName = element.tagName;
  return tagName.substr(tagName.indexOf(':') + 1);
};

checkUtil.formatMessage = function (validationInfo) {
  var name = (validationInfo.name) ? 'name:[' + validationInfo.name + '] (ID:' + validationInfo.id + ')' : 'ID:[' + validationInfo.id + ']';
  var string = validationInfo.elementType + ' ' + name + ': ' + validationInfo.message;
  return string;
};

module.exports = checkUtil;