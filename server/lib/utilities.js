const https = require('https');

/**
 * Wraps an https request in a promise
 *
 * @param {string | https.RequestOptions | URL} params
 * @param {any} postData
 * @return {Promise<ClientRequest>}
 */
const httpsRequest = (params, postData) => {
    return new Promise(function(resolve, reject) {
        var req = https.request(params, function(res) {

            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('statusCode=' + res.statusCode));
            }

            var body = '';
            res.on('data', function(chunk) {
                body += chunk;
            });

            res.on('end', function() {
                resolve(body);
            });
        });

        req.on('error', function(err) {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }

        req.end();
    });
};

module.exports = { httpsRequest }