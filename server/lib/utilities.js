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

/**
 * Same as Promise.all(items.map(item => task(item))), but it waits for
 * the first {batchSize} promises to finish before starting the next batch.
 * https://stackoverflow.com/questions/37213316/execute-batch-of-promises-in-series-once-promise-all-is-done-go-to-the-next-bat
 *
 * @template A
 * @template B
 * @param {function(A): B} task The task to run for each item.
 * @param {A[]} items Arguments to pass to the task for each call.
 * @param {int} batchSize
 * @returns {Promise<B[]>}
 */
 async function promiseAllInBatches(task, items, batchSize) {
    let position = 0;
    let results = [];
    while (position < items.length) {
        const itemsForBatch = items.slice(position, position + batchSize);
        results = [...results, ...await Promise.all(itemsForBatch.map(item => task(item)))];
        position += batchSize;
    }
    return results;
}

module.exports = { httpsRequest, promiseAllInBatches }