const path = require('path');
const fs = require('fs').promises;

// Map of resources and how to handle them.
const RESOURCES = {
    token: {
        path: path.join(process.cwd(), 'sort-service/token.json'),
        protected: true
    },
    credentials: {
        path: path.join(process.cwd(), 'sort-service/credentials.json'),
        protected: true
    },
    subscriptions: {
        path: path.join(process.cwd(), 'sort-service/state/subscriptions.json'),
        defaultExpire: 43200000,
        protected: false
    },
    playlists: {
        path: path.join(process.cwd(), 'sort-service/state/playlists.json'),
        defaultExpire: 43200000,
        protected: false
    },
    history: {
        path: path.join(process.cwd(), 'sort-service/state/history.json'),
        protected: false
    },
    rules: {
        path: path.join(process.cwd(), 'sort-service/state/rules.json'),
        protected: false
    },
    videos: {
        path: path.join(process.cwd(), 'sort-service/state/videos.json'),
        protected: false
    }
}

/**
 * Reads previously authorized credentials from the save file.
 * Returns JSON.
 *
 * @param {string} resourceName - Lookup to the resource map.
 * @param {bolean} useCache - defaults to true.
 * @param {number | false} - Optional timestamp that bypasses returning cache if it is larger than the lastUpdated value of the cache. Default is false.
 * @param {boolean} loadProtected - Allows cache with "protected" set to true in the map to be loaded. Default is false.
 * @return {<any|false>}
 */
const loadResource = async (resourceName, useCache = true, expireTime = false, loadProtected = false) => {
    const resource = RESOURCES[resourceName];

    // Check if cache is being bypassed
    if (!useCache) {
        console.log(`  Bypassing ${resourceName} cache.`)
        return false;
    }

    // Validate known resource
    if (!resource)
        throw `No definition for resource: ${resourceName}`;

    // Validate protected resources can be loaded
    if (resource.protected && !loadProtected)
        throw `The resource "${resourceName}" is protected, but the "loadProtected" parameter was not supplied, or is set to false.`;

    // Load and return the resource
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

/**
 * Caches a resource file.
 * Returns boolean for success/fail.
 *
 * @param {string} resourceName - Lookup to the resource map.
 * @param {any} data - JSON data to write to the cache.
 * @param {boolean} addTimestamp - Defaults to true.
 * @param {boolean} loadProtected - Allows cache with "protected" set to true in the map to be written. Default is false.
 * @return {<any|false>}
 */
const cacheResource = async(resourceName, data, addTimestamp = true, loadProtected = false) => {
    const resource = RESOURCES[resourceName];
    console.log(`  Caching ${resourceName}`);

    // Validate known resource
    if (!resource)
        throw `No definition for resource: ${resourceName}`;

    // Validate data is supplied
    if (!data)
        throw `No data to cache. Data variable is empty.`;

    // Validate protected resources can be loaded
    if (resource.protected && !loadProtected)
        throw `The resource "${resourceName}" is protected, but the "loadProtected" parameter was not supplied, or is set to false.`;

    try {
        if (addTimestamp) {
            data.lastUpdated = Date.now();
        }
        await fs.writeFile(resource.path, JSON.stringify(data));
        return true;
    } catch (err) {
        console.log(`  Error writing file: ${resource.path}`);
        console.log(err);
        return false;
    }
};

/**
 * Empties the history.unsorted array.
 *
 * @return {<true>}
 */
const purgeUnsorted = async() => {
    console.log('  Purging unsorted items.')
    let history = await loadResource('history');
    history.unsorted = [];
    await cacheResource('history', history);
    return true;
};

/**
 * Deletes the item with matching ID from the history.unsorted array.
 *
 */
 const deleteUnsortedItem = async(id) => {
    console.log(`  Deleting unsorted item: ${id}`);
    let history = await loadResource('history');
    history.unsorted = history.unsorted.filter(u => u.id !== id);
    return await cacheResource('history', history);
};

/**
 * Empties the history.errorQueue array.
 *
 */
const purgeErrors = async() => {
    console.log('  Purging the error queue.');
    let history = await loadResource('history');
    history.errorQueue = [];
    await cacheResource('history', history);
};

/**
 * Deletes a rule by the specified ID.
 *
 * @param {id} string - Rule ID to delete.
 * @return {<true>}
 */
const deleteRule = async(id) => {
    console.log(`  Deleting rule: ${id}`);
    let rules = await loadResource('rules');
    let ix = await rules.rules.findIndex(r => r.id == id);
    if (ix >= 0) {
        rules.rules.splice(ix, 1);
        await cacheResource('rules', rules);
        return true;
    } else {
        return false;
    }
}

/**
 * Updates the given rule.
 *
 * @param {rule} Rule - Updated rule object.
 * @return {<boolean>}
 */
const updateRule = async(rule) => {
    console.log(`  Updating rule: ${rule.id}`);
    let rules = await loadResource('rules');
    let ix =await  rules.rules.findIndex(r => r.id === rule.id);
    if (ix >= 0) {
        rules.rules[ix] = rule;
        await cacheResource('rules', rules);
        return true;
    } else {
        return false;
    }
}

/**
 * Adds the given rule.
 *
 * @param {rule} Rule - Rule object.
 * @return {<boolean>}
 */
const addRule = async(rule) => {
    console.log(`  Adding rule: ${rule.id}`);
    let rules = await loadResource('rules');
    rules.rules.push(rule);
    await cacheResource('rules', rules);
    return true;
}

module.exports = { loadResource, cacheResource, purgeUnsorted, deleteUnsortedItem, updateRule, deleteRule, addRule, purgeErrors };
