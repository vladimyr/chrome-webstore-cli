'use strict';

const Promise = require('pinkie-promise');
const cws = require('chrome-webstore');
const utils = require('../lib/utils.js');
const printer = require('../lib/printer.js');

function fetchExtensionInfo(client, id, extensions) {
  extensions = Object.assign(extensions, {
    succeded: [],
    failed: [],
    info: {}
  });

  return client.getItemInfo(id)
    .then(info => {
      extensions.info[id] = info;
      extensions.succeded.push(id);
      return info;
    })
    .catch(() => extensions.failed.push(id));
}

function getExtensionsInfo(options) {
  options = options || {};

  return Promise.all([
      cws.getVersion(),
      utils.getInstalledIds(options.dir)
    ])
    .then(results => {
      let version = results[0];
      let localInfo = results[1];

      let ids = localInfo.ids;
      let data = {
        total: ids.length,
        extensionDir: localInfo.extensionDir
      };

      let client = cws.createClient(version);
      return Promise.all(ids.map(id => fetchExtensionInfo(client, id, data)))
        .then(() => data);
    });
}

module.exports = {
  command: 'list',
  desc: 'List locally installed extensions',
  builder(yargs) {
    return yargs.option('j', {
        alias: 'json',
        describe: 'Output data in JSON format'
      })
      .option('d', {
        alias: 'dir',
        describe: 'Set extension directory'
      })
      .option('ids-only', {
        describe: 'Output extension IDs only'
      })
      .help('help');
  },
  handler(argv) {
    return getExtensionsInfo(argv)
      .then(info => printer.print(info, argv));
  }
};
