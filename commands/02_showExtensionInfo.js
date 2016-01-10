'use strict';

var cws = require('chrome-webstore-query');
var chalk = require('chalk');
var listPrinter = require('../lib/printExtensionInfo.js');


function printExtensionInfo(id, options) {
  options = options || {};

  return cws.getVersion()
    .then(function complete(version) {
      var client = cws.createClient(version);
      return client.getItemInfo(id);
    })
    .then(function obtained(data) {
      if (options.json) {    
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      listPrinter.printOne(data);
    });
}

function showExtensionInfo(yargs) {
  var argv = yargs
    .usage('\nUsage:\n  cws <command> [options] [extensionId]')
    .demand(1)
    .option('json', {
      describe: 'Output data in JSON format'
    })
    .help('help')
    .alias('h', 'help')
    .argv;

  var extensionId = argv._[1];

  if (!extensionId) {
    var message = 'Extension id is not provided!';
    console.error('%s %s', chalk.bold.red('Error:'), chalk.white(message));
    process.exit(1);
  }

  return printExtensionInfo(extensionId, { json: argv.json });
}

module.exports = {
  name: 'info', 
  desc: 'Show extension info',
  action: showExtensionInfo
};
