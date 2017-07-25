var fs = require('fs');

var okButton = document.querySelector('#ok');
var cancelButton = document.querySelector('#cancel');
okButton.addEventListener('click', onOkClick);
cancelButton.addEventListener('click', onCancelClick);

var config = {};
var configFileUtil = require('../util/ConfigFileUtil');

var tabItems = document.querySelectorAll('.tab-item');

for (var i = 0; i < tabItems.length; i++) {
  tabItems[i].addEventListener('click', onTabClick);
}

function onOkClick() {
  var activeTab =document.querySelector('.active');
  saveActiveTabToConfig(activeTab);

  configFileUtil.saveConfigFile(config);
  window.close()
}
function onCancelClick() {
  window.close()
}

function onTabClick() {

  var activeTab =document.querySelector('.active');

  saveActiveTabToConfig(activeTab);

  activeTab.classList.remove('active');
  this.classList.add('active');

  loadActiveTabFromConfig(this);
}

function saveActiveTabToConfig(activeTab){
  var contents = document.getElementById('textarea').value;

  switch (activeTab.id) {
    case 'bean-tab':
      config.properties.bean = contents.split('\n');
      break;
    case 'entity-tab':
      config.properties.entities = contents.split('\n');
      break;
    case 'error-entity-tab':
      config.properties.errorEntity = contents.split('\n');
      break;
    case 'file-name-tab':
      config.properties.fileName = contents.split('\n');
      break;

  }
}

function loadActiveTabFromConfig(activeTab){
  switch (activeTab.id) {
    case 'bean-tab':
      document.getElementById('textarea').value = config.properties.bean.join('\n');
      break;
    case 'entity-tab':
      document.getElementById('textarea').value = config.properties.entities.join('\n');
      break;
    case 'error-entity-tab':
      document.getElementById('textarea').value = config.properties.errorEntity.join('\n');
      break;
    case 'file-name-tab':
      document.getElementById('textarea').value = config.properties.fileName.join('\n');
      break;
  }
}

window.onload = function(){
  config = JSON.parse(configFileUtil.loadConfigFile());
  document.getElementById('textarea').value = config.properties.bean.join('\n');

};