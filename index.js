'using strict';

var os      = require('os'),
    Q       = require('q'),
    qfs     = require('q-io/fs'),
    cheerio = require('cheerio'),
    qs      = require('querystring'),
    request = require('request');

if (os.platform() !== 'win32')
    return;

var extensionDataDir = 'C:\\Program Files\\Google\\Chrome\\User Data\\Default\\Extensions';

// wraps value in a promise
Q.wrap = function(val){
    return Q.fcall(function(){
        return val;
    });
};

function getChromeWebStoreVersion() {
    var deferred = Q.defer();

    var webStoreUrl = 'https://chrome.google.com/webstore/category/apps';

    request.get(webStoreUrl, function(err, response, body){
        if (err) {
            deferred.reject(err);
            return;
        }

        // extract cws data
        var $ = cheerio.load(body),
        cwsSessionData = JSON.parse($('#cws-session-data').html());

        // resolve with cwsVersion
        deferred.resolve(cwsSessionData[20]);
    });

    return deferred.promise;
}

function getExtensionInfo(cwsVersion, id) {
    var deferred = Q.defer();

    // request params
    var webStoreUrl   = 'https://chrome.google.com/webstore/ajax/detail',
        versionNumber = cwsVersion || 1386366176,

        query = {
            pv: versionNumber,
            hl: 'en',
            id: id
        };

    // create url
    var url = webStoreUrl + '?' + qs.stringify(query);

    // send POST request
    request.post(url, function(err, response, body){
        if (err) {
            deferred.reject(err);
            return;
        }

        deferred.resolve(body);
    });

    return deferred.promise; 
}

function processExtension(id, index, cwsVersion){
    index += 1;

    getExtensionInfo(cwsVersion, id)
        .then(function obtained(info){
            // unmangle response
            info = info
                    .replace(/^\)\]\}'/, '')
                    .replace(/,+/g, ',');

            var data    = {},
                dataArr = JSON.parse(info);

            var extName = dataArr[1][1][0][1];

            console.log(extName + ': ' + dataArr[1][1].length);

            qfs.write('./data/' + extName + '.json', JSON.stringify(dataArr, null, '  '));

            dataArr.forEach(function(items){
                var obj = {},
                    key = items[0],
                    val = items.slice(1);

                data[key] = val;
            });

            return Q.wrap(data);
        })
        .then(function parsed(data){
            var prefix = "https://chrome.google.com/webstore/detail/"

            var len = data.getitemdetailresponse[0][0].length;

            console.log('[' + index + '] ' + data.getitemdetailresponse[0][0][1]);
            // console.log(data.getitemdetailresponse[0][0][len - 1]);
            console.log(prefix + data.getitemdetailresponse[0][0][0]);
            console.log('----------------------------------------');
        });
}

// chrome web store version number
var cwsVersion;

getChromeWebStoreVersion()
    .then (function obtained(version){
        // cache version number
        cwsVersion = version;
        return qfs.list(extensionDataDir)
    })
    .then(function obtained(items){
        // filter directories
        return Q.all(items.filter(function(item){
            return qfs.isDirectory(item);
        }));
    })
    .then(function filtered(folders){
        console.log('Found ' + folders.length + ' extensions:\n');

        var processorFn = function(id, index){
            return processExtension(id, index, cwsVersion);
        }

        // process extensions
        folders.forEach(processorFn);
    });