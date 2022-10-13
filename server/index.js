const express = require('express')
const { loadResource } = require('../sort-service/lib/resources');
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

    
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})