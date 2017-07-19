'use strict';

var fs = require('fs');

var config = {};

function ComponentProvider () {
}

ComponentProvider.readConfigFile = function () {
  config = JSON.parse(fs.readFileSync('./propertyConfig.json', 'utf8'));
};

ComponentProvider.getBatchlets = function () {
  return config.properties.batchlet;
};
ComponentProvider.getItemReaders = function () {
  return config.properties.itemReader;
};
ComponentProvider.getItemProcessors = function () {
  return [];
};
ComponentProvider.getItemWriters = function () {
  return config.properties.itemWriter;
};
ComponentProvider.getListeners = function () {
  return config.properties.listener;
};

ComponentProvider.getStepType = function () {
  return Object.keys(config.properties.stepType);
};

ComponentProvider.getEntities = function () {
  return config.properties.entities;
};

ComponentProvider.getErrorEntities = function () {
  return config.properties.errorEntity;
};

ComponentProvider.getMode = function () {
  return config.properties.mode;
};

ComponentProvider.getBean = function() {
  return config.properties.bean;
};

ComponentProvider.readConfigFile();

module.exports = ComponentProvider;