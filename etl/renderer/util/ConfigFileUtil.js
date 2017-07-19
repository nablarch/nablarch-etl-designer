var url = require('url');
var path = require('path');
var fs = require('fs');

var fsModules = {};

function saveFileSync(fileName, filePath){

  fs.writeFileSync()

}

fsModules.loadFileSync = function(filePath, fileName){
  return fs.readFileSync(path.join(__dirname, filePath + '/' + fileName), 'utf8');
};

fsModules.loadConfigFile = function(){
  this.loadConfigFile('../../../../', 'propertyConfig');
};


module.exports = fsModules;