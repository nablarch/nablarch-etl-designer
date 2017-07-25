'use strict';

var config = {};
var configFileUtil = require('./ConfigFileUtil');

function ComponentProvider () {
}

ComponentProvider.readConfigFile = function () {
  config = JSON.parse(configFileUtil.loadConfigFile());
};

ComponentProvider.getBatchlets = function () {
  this.readConfigFile();
  return config.properties.batchlet;
};
ComponentProvider.getItemReaders = function () {
  this.readConfigFile();
  return config.properties.itemReader;
};
ComponentProvider.getItemProcessors = function () {
  this.readConfigFile();
  return [];
};
ComponentProvider.getItemWriters = function () {
  this.readConfigFile();
  return config.properties.itemWriter;
};
ComponentProvider.getListeners = function () {
  this.readConfigFile();
  return config.properties.listener;
};

ComponentProvider.getStepType = function () {
  return Object.keys(config.properties.stepType);
};

ComponentProvider.getEntities = function () {
  this.readConfigFile();
  return config.properties.entities;
};

ComponentProvider.getErrorEntities = function () {
  this.readConfigFile();
  return config.properties.errorEntity;
};

ComponentProvider.getMode = function () {
  return config.properties.mode;
};

ComponentProvider.getBean = function() {
  this.readConfigFile();
  return config.properties.bean;
};

ComponentProvider.readConfigFile();

module.exports = ComponentProvider;