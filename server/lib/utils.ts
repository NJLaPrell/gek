import { IncomingMessage } from 'http';
import * as https from 'https';

/**
 * Wraps an https request in a promise
 *
 * @param {string | https.RequestOptions | URL} params
 * @param {any} postData
 * @return {Promise<ClientRequest>}
 */
export const httpsRequest = (params: any, postData?: any) => {
  return new Promise(function(resolve, reject) {
    const req = https.request(params, (res: IncomingMessage) => {
      
      if (<number>res.statusCode < 200 || <number>res.statusCode >= 300) {
        return reject(new Error(`statusCode=${res.statusCode}`));
      }
    
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', (err) => reject(err));

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
export const promiseAllInBatches = async (task: any, items: any, batchSize: number) => {
  let position = 0;
  let results: any = [];
  while (position < items.length) {
    const itemsForBatch = items.slice(position, position + batchSize);
    results = [...results, ...await Promise.all(itemsForBatch.map((item: any) => task(item)))];
    position += batchSize;
  }
  return results;
};

