'use strict';

var hr = require('hr');
var chalk = require('chalk');


function printExtensionInfo(info, i) {
  console.log();
  var once = typeof i !== 'number';
  var index = once ? '#' : i + 1;

  console.log(' [%s] %s', chalk.blue(index), chalk.blue.bold(info.name));

  console.log();
  console.log(' Description: %s', info.description.title);
  console.log(' Type: %s', info.type);
  console.log(' Author: %s', info.author);
  console.log(' Website: %s', info.website);
  console.log(' Category: %s', info.category);
  console.log(' Id: %s', chalk.yellow(info.id));
  console.log(' Store url: %s', info.webstoreUrl);
  console.log();

  if (!once)
    hr.hr('-');
}

function printExtensionsList(data) {
  var failed = data.failed;
  var succeded = data.succeded;

  console.log(' Installed extension/s count:', data.total);
  
  if (failed.length) {
    console.log(' Fetching info data failed for %d extension/s:', failed.length);
    failed.forEach(function(id) {
      console.log('  %s', id);
    });
  }

  console.log();
  succeded.forEach(function(id, i) {
    printExtensionInfo(data[id], i);
  });
}

module.exports = {
  print: printExtensionsList,
  printOne: printExtensionInfo
};