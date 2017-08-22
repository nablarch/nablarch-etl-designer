'use strict';

var config = {};
var configFileUtil = require('./ConfigFileUtil');

function EtlDesignerComponentProvider () {
}

EtlDesignerComponentProvider.readConfigFile = function () {
  config = configFileUtil.loadConfigFile();
};

EtlDesignerComponentProvider.getBatchlets = function () {
  this.readConfigFile();
  return config.properties.batchlet;
};
EtlDesignerComponentProvider.getItemReaders = function () {
  this.readConfigFile();
  return config.properties.itemReader;
};
EtlDesignerComponentProvider.getItemProcessors = function () {
  this.readConfigFile();
  return [];
};
EtlDesignerComponentProvider.getItemWriters = function () {
  this.readConfigFile();
  return config.properties.itemWriter;
};
EtlDesignerComponentProvider.getListeners = function () {
  this.readConfigFile();
  return config.properties.listener;
};

EtlDesignerComponentProvider.getStepType = function () {
  return Object.keys(config.properties.stepType);
};

EtlDesignerComponentProvider.getEntities = function () {
  this.readConfigFile();
  return config.properties.entities;
};

EtlDesignerComponentProvider.getErrorEntities = function () {
  this.readConfigFile();
  return config.properties.errorEntity;
};

EtlDesignerComponentProvider.getMode = function () {
  return config.properties.mode;
};

EtlDesignerComponentProvider.getBean = function() {
  this.readConfigFile();
  return config.properties.bean;
};

EtlDesignerComponentProvider.getColumns = function() {
  this.readConfigFile();
  return config.properties.columns;
};

EtlDesignerComponentProvider.readConfigFile();

module.exports = EtlDesignerComponentProvider;