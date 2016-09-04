'use strict';

const hr = require('hr');
const chalk = require('chalk');

const template = info => `
 Description: ${ info.description.title }
 Type: ${ info.type }
 Version: ${ info.version }
 Author: ${ info.author }
 Website: ${ info.website }
 Category: ${ info.category }
 Id: ${ chalk.yellow(info.id) }
 Store url: ${ info.webstoreUrl }`;

function printHeader(data) {
  // Print installed extensions info.
  if (data.total !== 1) {
    console.error(' Installed extension/s count:', chalk.bold(data.total));
    console.error(' Extension directory:', chalk.bold(data.extensionDir));
    console.error();
  }

  // Print failed queries info.
  let failed = data.failed;
  if (data.failed.length) {
    console.error(chalk.bold.red(' Fetching info failed for %d extension/s:'), failed.length);
    failed.forEach(id => console.error(chalk.red('  * %s'), id));
  }
}

function printSimpleList(data) {
  printHeader(data);

  // Print IDs.
  console.log();
  data.succeded.forEach(id => console.log(id));
}

function printList(data) {
  printHeader(data);

  // blank line...
  console.log();

  // Print single extension info.
  if (data.total === 1) {
    let info = data.info[data.succeded[0]];
    console.log(' [#] %s', chalk.blue.bold(info.name));
    console.log(template(info));
    console.log();
    return;
  }

  // Print multi extension info.
  data.succeded.forEach((id, i) => {
    let info = data.info[id];
    console.log(' [%s] %s', chalk.blue(i + 1), chalk.blue.bold(info.name));
    console.log(template(info));
    hr.hr('-');
  });
}

module.exports = { print };

function print(data, options) {
  options = options || {};

  // Output IDs only.
  if (options.idsOnly) {
    printSimpleList(data, options);
    return;
  }

  // Output JSON.
  if (options.json) {
    data.succeded = data.succeded.length;
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  // Output list.
  printList(data, options);
}
