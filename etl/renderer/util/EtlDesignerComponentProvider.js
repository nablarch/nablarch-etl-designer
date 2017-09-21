'use strict';

var properties = {};
var configFileUtil = require('./ConfigFileUtil');

function EtlDesignerComponentProvider() {
}

EtlDesignerComponentProvider.readConfigFile = function () {
  properties = configFileUtil.getProperties();
};

EtlDesignerComponentProvider.getBatchlets = function () {
  this.readConfigFile();
  return properties.batchlet;
};
EtlDesignerComponentProvider.getItemReaders = function () {
  this.readConfigFile();
  return properties.itemReader;
};
EtlDesignerComponentProvider.getItemProcessors = function () {
  this.readConfigFile();
  return properties.itemProcessor;
};
EtlDesignerComponentProvider.getItemWriters = function () {
  this.readConfigFile();
  return properties.itemWriter;
};
EtlDesignerComponentProvider.getListeners = function () {
  this.readConfigFile();
  return properties.listener;
};

EtlDesignerComponentProvider.getStepType = function () {
  return Object.keys(properties.stepType);
};

EtlDesignerComponentProvider.getEntities = function () {
  this.readConfigFile();
  return properties.entities;
};

EtlDesignerComponentProvider.getErrorEntities = function () {
  this.readConfigFile();
  return properties.errorEntity;
};

EtlDesignerComponentProvider.getMode = function () {
  return properties.mode;
};

EtlDesignerComponentProvider.getBean = function () {
  this.readConfigFile();
  return properties.bean;
};

EtlDesignerComponentProvider.getColumns = function () {
  this.readConfigFile();
  return properties.columns;
};

EtlDesignerComponentProvider.readConfigFile();

module.exports = EtlDesignerComponentProvider;