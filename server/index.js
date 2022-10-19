const express = require('express')
const { loadResource, purgeUnsorted, deleteUnsortedItem, addRule, updateRule, deleteRule, purgeErrors } = require('../sort-service/lib/resources');
const { getChannelFeed, getPlaylistFeed, addToPlaylist } = require('../sort-service/lib/api-calls');
const app = express()
const port = 3000
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

const bodyParser = require('body-parser');
app.use(bodyParser.json({ extended: true }));
//app.use(express.json());

app.get('/api/getResource/:resource', (req, res) => {
    console.log('GET: /api/getResource/:resource');
    const resource = req.params.resource;
    const response = loadResource(resource)
        .then(contents => {
            if (contents) {
                res.json(contents);
            } else {
                res.status(500).json({ error: `Unable to load resource: ${resource}` });
            }
        })
        .catch(e => res.status(404).json({ error: e }));
});

app.get('/api/getChannelFeed/:id', (req, res) => {
    console.log('GET: /api/getChannelFeed/:id');
    const id = req.params.id;
    const response = getChannelFeed(id)
        .then(contents => {
            if (contents) {
                res.json(contents);
            } else {
                res.status(500).json({ error: `Unable to load channel feed: ${id}` });
            }
        })
        .catch(e => res.status(404).json({ error: e }));
});

app.get('/api/getPlaylistFeed/:id', (req, res) => {
    
    const id = req.params.id;
    const useGApi = req.query.useGApi === 'true';
    console.log(`GET: /api/getPlaylistFeed/${id}?useGApi=${useGApi}`);
    const response = getPlaylistFeed(id, false, useGApi)
        .then(contents => {
            if (contents) {
                res.json(contents);
            } else {
                res.status(500).json({ error: `Unable to load playlist feed: ${id}` });
            }
        })
        .catch(e => res.status(404).json({ error: e }));
});

app.put('/api/resources/updateRule', (req, res) => {
    console.log('PUT: /api/resources/updateRule');
    const response = updateRule(req.body)
        .then(success => {
            if (success) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: `No rule found with id: ${rule.id}.` });
            }
        })
        .catch(e => res.status(e.code).json({ error: e.message }));
});
app.delete('/api/resources/deleteRule/:id', (req, res) => {
    console.log('DELETE: /api/resources/deleteRule/:id');
    const id = req.params.id;
    const response = deleteRule(id)
        .then(success => {
            if (success) {
                res.status(204).send();
            } else {
                res.status(404).json({ error: `No rule found with id: ${rule.id}.` });
            }
        })
        .catch(e => res.status(e.code).json({ error: e.message }));
});

app.post('/api/resources/addRule', (req, res) => {
    console.log('POST: /api/resources/addRule');
    const response = addRule(req.body)
        .then(contents => {
            res.status(201).send();
        })
        //.catch(e => res.status(e.code).json({ error: e.message }));
});

app.post('/api/history/purgeUnsorted', (req, res) => {
    console.log('POST: /api/history/purgeUnsorted');
    const response = purgeUnsorted().then(res.status(204).send()).catch(e => res.status(e.code).json({ error: e.message }));
});

app.post('/api/history/purgeErrors', (req, res) => {
    console.log('POST: /api/history/purgeErrors');
    const response = purgeErrors().then(res.status(204).send()).catch(e => res.status(e.code).json({ error: e.message }));
});

app.post('/api/runSort', (req, res) => {
    console.log('POST: /api/runSort');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    //runSort().then(results => res.status(201).json(results));
    const child = spawn('npm', ['run', 'sort']);
    child.stdout.pipe(res);
    //child.stdout.on('error', (e) => console.log(e)).on('data', (m) => res.write(m)).on('close', () => res.end());

});

app.delete('/api/history/deleteUnsortedItem/:id', (req, res) => {
    const id = req.params.id;
    console.log(`DELETE: /api/history/deleteUnsortedItem/${id}`);
    const response = deleteUnsortedItem(id).then(res.status(204).send())
        //.catch(e => res.status(e.code).json({ error: e.message }));
});

app.put('/api/video/:videoId/addToPlaylist/:playlistId', (req, res) => {
    const videoId = req.params.videoId;
    const playlistId = req.params.playlistId;
    console.log(videoId);
    console.log(`PUT: /api/video/${videoId}/addToPlaylist/${playlistId}`);
    const response = addToPlaylist(playlistId, videoId).then(res.status(204).send())
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