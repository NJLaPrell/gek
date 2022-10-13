const path = require('path');
const fs = require('fs').promises;

const RESOURCES = {
    token: {
        path: path.join(process.cwd(), 'sort-service/token.json')
    },
    credentials: {
        path: path.join(process.cwd(), 'sort-service/credentials.json')
    },
    subscriptions: {
        path: path.join(process.cwd(), 'sort-service/state/subscriptions.json'),
        defaultExpire: 43200000
    },
    playlists: {
        path: path.join(process.cwd(), 'sort-service/state/playlists.json'),
        defaultExpire: 43200000
    },
    history: {
        path: path.join(process.cwd(), 'sort-service/state/history.json')
    },
    rules: {
        path: path.join(process.cwd(), 'sort-service/state/rules.json')
    },
    videos: {
        path: path.join(process.cwd(), 'sort-service/state/videos.json')
    }
}

const loadResource = async (resourceName, useCache = true, expireTime = false) => {
    const resource = RESOURCES[resourceName];
    if (!resource)
        throw `No definition for resource: ${resourceName}`;

    if (!useCache) {
        console.log(`  Bypassing ${resourceName} cache.`)
        return false;
    }

    try {
        const content = await fs.readFile(resource.path);
        const data = JSON.parse(content);
        if (!expireTime || (expireTime && Date.now() - data.lastUpdated < expireTime)) {
            console.log(`  Retrieved ${resourceName} from cache.`);
            return data;
        } else {
            console.log(`  Cache for ${resourceName} is expired.`);
            return false;
        }
    } catch (err) {
        console.log(`  Error opening file: ${resource.path}`);
        console.log(err);
        return false;
    }
};

const cacheResource = async(resourceName, data) => {
    const resource = RESOURCES[resourceName];
    console.log(`  Caching ${resourceName}`);

    if (!resource)
        throw `No definition for resource: ${resourceName}`;

    if (!data)
        throw `No data to cache. Data variable is empty.`;

    try {
        data.lastUpdated = Date.now();
        await fs.writeFile(resource.path, JSON.stringify(data));
    } catch (err) {
        console.log(`  Error writing file: ${resource.path}`);
        console.log(err);
        return false;
    }
};






module.exports = { loadResource, cacheResource };
