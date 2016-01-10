'use strict';

var fs = require('fs');
var got = require('got');
var chalk = require('chalk');
var cws = require('chrome-webstore-query');
var path = require('path');
var Promise = require('pinkie-promise');
var format = require('string-format');
format.extend(String.prototype);


var crxUrl = 'https://clients2.google.com/service/update2/crx';
var query = '?response=redirect&prodversion=38.0&x=id%3D{extensionId}%26installsource%3Dondemand%26uc';

var userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36';

var headers = {
  'User-Agent': userAgent,
  'Referer': 'https://chrome.google.com',
};

function downloadExtension(yargs) {
  var argv = yargs
    .usage('\nUsage:\n  cws <command> [options] [extensionId]')
    .demand(1)
    .option('o', {
      alias: 'output',
      required: true,
      describe: 'Path where downloaded .crx file will be stored'
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

  if (!argv.output) {
    var message = 'Output path is not provided!'; //jshint ignore:line
    console.error('%s %s', chalk.bold.red('Error:'), chalk.white(message));
    process.exit(1);
  }

  return cws.getVersion()
    .then(function complete(version) {
      var client = cws.createClient(version);
      return client.getItemInfo(extensionId);
    })
    .then(function obtained(data) {
      var filename = '{name}_{version}.crx.zip'.format({
        name: data.name,
        version: data.version
      });

      var outputDir = path.join(argv.output, '/');
      var outputPath = path.join(outputDir, filename);

      console.log('Downloading %s of data to: \n%s', data.size, outputPath);

      var url = crxUrl + query.format({ extensionId: extensionId });
      return new Promise(function(resolve, reject) {
        got.stream(url, headers)
          .pipe(fs.createWriteStream(outputPath))
          .on('end', resolve)
          .on('error', reject);
      });
    });
}

module.exports = {
  name: 'download',
  desc: 'Downloads extension\'s package (.crx) from webstore',
  action: downloadExtension
};
