#!/usr/bin/env node

'use strict';

const yargs = require('yargs');
const chalk = require('chalk');
const pkg = require('../package.json');

// Parse command line arguments.
yargs.version(pkg.version)
  .usage('\nUsage:\n  $0 (command) <options>')
  .commandDir('../commands')
  .required(1, 'Command is required!')
  .help('help')
  .alias('h', 'help')
  .strict()
  .fail(msg => {
    console.error(chalk.red.bold('Error:'), chalk.white(msg));
    process.exit(1);
  })
  .argv; //jshint ignore:line
