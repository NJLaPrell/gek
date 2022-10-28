import { Request, Response } from "express";

interface ExpressRequest extends Request {
    
}

interface ExpressResponse extends Response {

}



const express = require('express')
const { loadResource, purgeUnsorted, deleteUnsortedItem, addRule, updateRule, deleteRule, purgeErrors, deleteErrorItem } = require('./lib/resources');
const { getChannelFeed, getPlaylistFeed, addToPlaylist, rateVideo, removeVideo } = require('./lib/api-calls');
const app = express()
const port = 3000
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');
const { getSortedList, removeVideoFromList } = require('./lib/web.js');

const bodyParser = require('body-parser');
app.use(bodyParser.json({ extended: true }));
//app.use(express.json());

app.get('/api/getResource/:resource', (req: ExpressRequest, res: ExpressResponse) => {
    const resource = req.params['resource'];
    console.log(`GET: /api/getResource/${resource}`);
    
    const response = loadResource(resource)
        .then((contents: any) => {
            if (contents) {
                res.json(contents);
            } else {
                res.status(500).json({ error: `Unable to load resource: ${resource}` });
            }
        })
        .catch((e: any) => res.status(404).json({ error: e }));
});

app.get('/api/getChannelFeed/:id', (req: ExpressRequest, res: ExpressResponse) => {
    console.log('GET: /api/getChannelFeed/:id');
    const id = req.params['id'];
    const response = getChannelFeed(id)
        .then((contents: any) => {
            if (contents) {
                res.json(contents);
            } else {
                res.status(500).json({ error: `Unable to load channel feed: ${id}` });
            }
        })
        .catch((e: any) => res.status(404).json({ error: e }));
});

app.get('/api/getPlaylistFeed/:id', (req: ExpressRequest, res: ExpressResponse) => {
    
    const id = req.params['id'];
    const useGApi = req.query['useGApi'] === 'true';
    console.log(`GET: /api/getPlaylistFeed/${id}?useGApi=${useGApi}`);
    const response = getPlaylistFeed(id, false, useGApi)
        .then((contents: any) => {
            if (contents) {
                res.json(contents);
            } else {
                res.status(500).json({ error: `Unable to load playlist feed: ${id}` });
            }
        })
        .catch((e: any) => res.status(404).json({ error: e }));
});

app.get('/api/getLists', (req: ExpressRequest, res: ExpressResponse) => {
    const nocache = req.query['nocache'] === 'true';
    console.log(`GET /api/getLists?nocache=${nocache}`);
    const response = getSortedList(nocache).then((contents: any) => res.json(contents));
});

app.put('/api/resources/updateRule', (req: ExpressRequest, res: ExpressResponse) => {
    console.log('PUT: /api/resources/updateRule');
    const response = updateRule(req.body)
        .then((success: boolean) => {
            if (success) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: `No rule found with id: ${req.body.id}.` });
            }
        })
        .catch((e: any) => res.status(e.code).json({ error: e.message }));
});
app.delete('/api/resources/deleteRule/:id', (req: ExpressRequest, res: ExpressResponse) => {
    console.log('DELETE: /api/resources/deleteRule/:id');
    const id = req.params['id'];
    const response = deleteRule(id)
        .then((success: boolean) => {
            if (success) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: `No rule found with id: ${id}.` });
            }
        })
        .catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.post('/api/resources/addRule', (req: ExpressRequest, res: ExpressResponse) => {
    console.log('POST: /api/resources/addRule');
    const response = addRule(req.body)
        .then(() => {
            res.status(201).send();
        })
        //.catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.post('/api/history/purgeUnsorted', (req: ExpressRequest, res: ExpressResponse) => {
    console.log('POST: /api/history/purgeUnsorted');
    const response = purgeUnsorted().then(res.status(204).send()).catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.post('/api/history/purgeErrors', (req: ExpressRequest, res: ExpressResponse) => {
    console.log('POST: /api/history/purgeErrors');
    const response = purgeErrors().then(res.status(204).send()).catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.post('/api/runSort', (req: ExpressRequest, res: ExpressResponse) => {
    console.log('POST: /api/runSort');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    //runSort().then(results => res.status(201).json(results));
    const child = spawn('npm', ['run', 'sort']);
    child.stdout.pipe(res);
    //child.stdout.on('error', (e) => console.log(e)).on('data', (m) => res.write(m)).on('close', () => res.end());

});

app.delete('/api/history/deleteUnsortedItem/:id', (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params['id'];
    console.log(`DELETE: /api/history/deleteUnsortedItem/${id}`);
    const response = deleteUnsortedItem(id).then(res.status(204).send())
        //.catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.delete('/api/history/deleteErrorItem/:id', (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params['id'];
    console.log(`DELETE: /api/history/deleteErrorItem/${id}`);
    const response = deleteErrorItem(id).catch((e: any) => res.status(e.code).json({ error: e.message })).then(res.status(204).send())
        //.catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.put('/api/video/:videoId/addToPlaylist/:playlistId', (req: ExpressRequest, res: ExpressResponse) => {
    const videoId = req.params['videoId'];
    const playlistId = req.params['playlistId'];
    console.log(`PUT: /api/video/${videoId}/addToPlaylist/${playlistId}`);
    const response = addToPlaylist(playlistId, videoId).then(res.status(204).send())
});

app.put('/api/video/:videoId/rate/:rating?', (req: ExpressRequest, res: ExpressResponse) => {
    const videoId = req.params['videoId'];
    const rating = req.params['rating'] || '';
    console.log(`PUT: /api/video/${videoId}/rate/${rating}`);
    const response = rateVideo(videoId, rating).then(res.status(204).send());
});

app.put('/api/playlistItem/remove/:playlistItemId', (req: ExpressRequest, res: ExpressResponse) => {
    const playlistItemId = req.params['playlistItemId'];
    console.log(`/api/playlistItem/remove/${playlistItemId}`);
    removeVideo(playlistItemId).then();
    removeVideoFromList(playlistItemId)
    res.status(204).send()
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});

async function runSort() {
    try {
        const { stdout, stderr } = await exec('npm run sort');
        return { stdout, stderr};
    } catch (err) {
       return { stdout: '', stderr: err };
    };
}