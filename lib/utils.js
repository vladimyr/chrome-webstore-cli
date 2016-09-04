'use strict';

const Promise = require('pinkie-promise');
const pify = require('pify');
const fs = require('fs');
const pathJoin = require('path').join;
const platform = require('os').platform();
const homeDir = require('user-home');

// Find Chrome's extensions directory on Windows according to:
// https://www.chromium.org/user-experience/user-data-directory
function getWinExtensionsDir() {
  let defaultDir = 'Google\\Chrome\\User Data\\Default\\Extensions\\';
  let candidates = [
    pathJoin(process.env.LOCALAPPDATA, defaultDir),
    pathJoin(process.env.PROGRAMFILES, defaultDir),
    pathJoin(process.env.USERPROFILE, '\\Local Settings\\Application Data\\', defaultDir)
  ];

  return Promise.all(candidates.map(candidate =>
    pify(fs.stat)(candidate).catch(() => null)))
  .then(stats => {
    // Return first candidate that exists.
    let i = 0;
    let len = stats.length;
    while (i < len) {
      if (stats[i]) return candidates[i];
    }

    return Promise.reject(new Error('Extensions dir is not found!'));
  });
}

// Find Chrome's extensions directory according to:
// https://www.chromium.org/user-experience/user-data-directory
function getExtensionsDir() {
  let defaultDir = 'Default/Extensions/';

  // Return linux extension's directory.
  if (platform === 'linux') {
    return Promise.resolve(pathJoin(homeDir, '.config/google-chrome/', defaultDir));
  } // Return OSX extension's directoy.
  if (platform === 'darwin') {
    return Promise.resolve(pathJoin(homeDir, 'Library/Application Support/Google/Chrome/', defaultDir));
  } // Return Windows extension's directory
  if (platform === 'win32') {
    return getWinExtensionsDir();
  }

  return Promise.reject(new Error('Extensions dir is not found!'));
}

function getInstalledIds(extensionDir) {
  // Find extensions directory.
  return new Promise((resolve, reject) => {
    if (extensionDir) return resolve(extensionDir);
    return getExtensionsDir().then(resolve, reject);
  })
  // Enumarate its subfolders.
  .then(path => {
    extensionDir = path;
    return pify(fs.readdir)(path);
  })
  // Filter only 32 chars wide alphabetic extension IDs.
  .then(names => {
    return {
      extensionDir,
      ids: names.filter(name => /^[a-z]{32}$/.test(name))
    };
  });
}

module.exports = {
  getExtensionsDir,
  getInstalledIds
};
