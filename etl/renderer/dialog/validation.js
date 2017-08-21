var etlDesignerCheck = require('../util/EtlDesignerChecker');

var checkButton = document.querySelector('#check');
var cancelButton = document.querySelector('#cancel');
checkButton.addEventListener('click', onCheckClick);
cancelButton.addEventListener('click', onCancelClick);

var tabItems = document.querySelectorAll('.tab-item');

var validationResult = {};

for (var i = 0; i < tabItems.length; i++) {
  tabItems[i].addEventListener('click', onTabClick);
}

function onCheckClick() {
  var result = etlDesignerCheck.check();
  validationResult.errorMessage = (result.errors.length === 0) ? 'エラーは検出されていません。' : result.errors.join('\n');
  validationResult.warningMessage = (result.warnings.length === 0) ? '警告は検出されていません。' : result.warnings.join('\n');
  loadActiveTab(document.querySelector('.active'));
}
function onCancelClick() {
  window.close();
}

function onTabClick() {

  var activeTab =document.querySelector('.active');

  saveActiveTab(activeTab);

  activeTab.classList.remove('active');
  this.classList.add('active');

  loadActiveTab(this);
}

function saveActiveTab(activeTab){
  var contents = document.getElementById('textarea').value;

  switch (activeTab.id) {
    case 'error-tab':
      validationResult.errorMessage = contents;
      break;
    case 'warning-tab':
      validationResult.warningMessage = contents;
      break;
  }
}

function loadActiveTab(activeTab){
  switch (activeTab.id) {
    case 'error-tab':
      document.getElementById('textarea').value = validationResult.errorMessage;
      break;
    case 'warning-tab':
      document.getElementById('textarea').value = validationResult.warningMessage;
      break;
  }
}

window.onload = function(){
  onCheckClick();
};