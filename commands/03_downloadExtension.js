'use strict';

const Promise = require('pinkie-promise');
const fs = require('fs');
const got = require('got');
const ora = require('ora');
const cws = require('chrome-webstore');
const chalk = require('chalk');
const path = require('path');
const urlJoin = require('url-join');

const crxUrl = 'https://clients2.google.com/service/update2/crx';
const query = id => `?response=redirect&prodversion=38.0&x=id%3D${ id }%26installsource%3Dondemand%26uc`;

const userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36';
const headers = {
  'User-Agent': userAgent,
  'Referer': 'https://chrome.google.com',
};

function getExtensionInfo(extensionId) {
  return cws.getVersion()
    .then(version => {
      let client = cws.createClient(version);
      return client.getItemInfo(extensionId);
    });
}

function downloadExtensionPackage(info, options) {
  options = options || {};
  let outputPath = path.join(
    options.dest, `/${ info.name }_${ info.version }.crx.zip`);

  const spinner = ora(
    `Downloading ${ info.size } of data to: ${ chalk.white(outputPath) }`);
  spinner.start();

  let url = urlJoin(crxUrl, query(options.extensionId));
  return new Promise((resolve, reject) => {
    got.stream(url, headers)
      .pipe(fs.createWriteStream(outputPath))
      .on('finish', resolve)
      .on('error', reject);
  })
  .then(() => spinner.succeed())
  .catch(err => {
    spinner.fail();
    console.error(chalk.bold.red('Error:'), err.message);
  });
}

module.exports = {
  command: 'download',
  desc: 'Downloads extension\'s package (.crx) from webstore',
  builder(yargs) {
    return yargs
      .required(1, 'Extension id is not provided!')
      .option('o', {
        alias: 'output',
        required: true,
        describe: 'Path where downloaded .crx file will be stored'
      })
      .help('help');
  },
  handler(argv) {
    let id = argv._[1];
    return getExtensionInfo(id)
      .then(info => downloadExtensionPackage(info, {
        dest: argv.output,
        extensionId: id
      }));
  }
};

