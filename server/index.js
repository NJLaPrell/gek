const express = require('express')
const { loadResource, purgeUnsorted } = require('../sort-service/lib/resources');
const { getChannelFeed, getPlaylistFeed } = require('../sort-service/lib/api-calls');
const app = express()
const port = 3000

app.get('/api/getResource/:resource', (req, res) => {
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
    const response = getPlaylistFeed(id)
        .then(contents => {
            if (contents) {
                res.json(contents);
            } else {
                res.status(500).json({ error: `Unable to load playlist feed: ${id}` });
            }
        })
        .catch(e => res.status(404).json({ error: e }));
});

app.post('/api/history/purgeUnsorted', (req, res) => {
    const response = purgeUnsorted().then(res.status(204).send()).catch(e => res.status(e.code).json({ error: e.message }));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});