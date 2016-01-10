'use strict';

var os = require('os');
var fs = require('fs');
var path = require('path');
var homeDir = require('user-home');
var Promise = require('pinkie-promise');
var pify = require('pify');

// according to: https://www.chromium.org/user-experience/user-data-directory
function getExtensionsDir() {
  var platform = os.platform();
  var defaultDir = 'Default/Extensions/';

  if (platform === 'linux')
    return Promise.resolve(path.join(homeDir, '.config/google-chrome/', defaultDir));
  if (platform === 'darwin')
    return Promise.resolve(path.join(homeDir, 'Library/Application Support/Google/Chrome/', defaultDir));

  if (platform !== 'win32')
    return Promise.reject(new Error('Extensions dir is not found!'));

  defaultDir = 'Google\\Chrome\\User Data\\Default\\Extensions\\';
  var candidates = [
    path.join(process.env.LOCALAPPDATA, defaultDir),
    path.join(process.env.PROGRAMFILES, defaultDir),
    path.join(process.env.USERPROFILE, '\\Local Settings\\Application Data\\', defaultDir)
  ];

  return Promise.all(candidates.map(function(candidate) {
    return pify(fs.stat)(candidate)
      .catch(function(err) { return null; });
  }))
  .then(function complete(stats) {
    var i = 0;
    var len = stats.length;
    while (i < len) {
      if (stats[i])
        return candidates[i];
    }

    return Promise.reject(new Error('Extensions dir is not found!'));
  });
}

function getInstalledIds(extensionDir) {
  return new Promise(function(resolve, reject) {
    if (extensionDir)
      return resolve(extensionDir);

    return getExtensionsDir()
      .then(resolve, reject);
  })
  .then(function complete(path) {
    return pify(fs.readdir)(path);
  })
  .then(function(names) {
    return names.filter(function(name) {
      return /^[a-z]{32}$/.test(name);
    });
  });
}

module.exports = getInstalledIds;
