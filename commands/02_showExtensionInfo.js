'use strict';

const cws = require('chrome-webstore');
const printer = require('../lib/printer.js');

function getExtensionInfo(id, options) {
  let data = {
    succeded: [],
    failed: [],
    total: 1,
    info: {}
  };

  options = options || {};

  return cws.getVersion()
    .then(version => {
      let client = cws.createClient(version);
      return client.getItemInfo(id);
    })
    .then(info => {
      data.info[id] = info;
      data.succeded.push(id);
    })
    .catch(() => data.failed.push(id))
    .then(() => data);
}

module.exports = {
  command: 'info',
  desc: 'Show extension info',
  builder(yargs) {
    return yargs
      .required(1, 'Extension id is not provided!')
      .option('j', {
        alias: 'json',
        describe: 'Output data in JSON format'
      })
      .help('help');
  },
  handler(argv) {
    let id = argv._[1];
    return getExtensionInfo(id)
      .then(info => printer.print(info, argv));
  }
};
