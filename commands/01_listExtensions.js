'use strict';

var cws = require('chrome-webstore-query');
var Promise = require('pinkie-promise');
var getInstalledIds = require('../lib/getInstalledIds.js');
var printer = require('../lib/printExtensionInfo.js');


function getExtensionInfo(client, id, extensions) {
  extensions.succeded = [];
  extensions.failed = [];

  return client.getItemInfo(id)
    .then(function(info) {
      extensions[id] = info;
      extensions.succeded.push(id);
      return info;
    })
    .catch(function(err) {
      extensions.failed.push(id);
    });
}

function printExtensionsList(options) {
  options = options || {};

  return Promise.all([
    cws.getVersion(),
    getInstalledIds(options.dir)
  ])
  .then(function complete(results) {
    var version = results[0];
    var ids = results[1];

    var data = {
      total: ids.length
    };

    var client = cws.createClient(version);
    return Promise.all(ids.map(function(id) {
      return getExtensionInfo(client, id, data);
    }))
    .then(function() {
      return data;
    });
  })
  .then(function obtained(data) {
    if (options.json) {    
      data.succeded = data.succeded.length;
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    printer.print(data);
  });
}

function listExtensions(yargs) {
  var argv = yargs
    .usage('\nUsage:\n  cws <command>')
    .option('json', {
      describe: 'Output data in JSON format'
    })
    .option('dir', {
      alias: 'd',
      describe: 'Set extension directory'
    })
    .help('help')
    .alias('h', 'help')
    .argv;

  return printExtensionsList({
    dir: argv.dir,
    json: argv.json
  });
}

module.exports = {
  name: 'list',
  desc: 'List locally installed extensions',
  action: listExtensions
};
