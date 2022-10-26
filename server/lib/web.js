const { getPlaylistPage, getPlaylistItemsPage, getVideoDetailsPage } = require('./api-calls');
const { loadResource, cacheResource } = require('./resources');
const path = require('path');
const fs = require('fs').promises;
const SCRATCH_PATH = path.join(process.cwd(), 'server/scratch.json')

function formatPlaylists(playlists) {
    return playlists.map(pl => ({
        playlistId: pl.id,
        title: pl.snippet.title,
        description: pl.snippet.description,
        thumbnail: pl.snippet.thumbnails?.medium?.url || pl.snippet.thumbnails?.default?.url,
        itemCount: pl.contentDetails.itemCount
    }));
}

function formatPlaylistItems(playlists) {
    let formattedPlaylists = [];
    playlists.forEach(ret => {
        ret.forEach(pl => {
            formattedPlaylists.push({
                videoId: pl.contentDetails.videoId,
                playlistId: pl.snippet.playlistId,
                playlistItemId: pl.id,
                playlistPosition: pl.snippet.position
            });
        });
    });
    return formattedPlaylists;
}

function formatVideoList(videoList) {
    return videoList.map(v => ({
        videoId: v.id,
        publishedAt: v.snippet.publishedAt,
        title: v.snippet.title,
        description: v.snippet.description,
        thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
        channelId: v.snippet.channelId,
        channelTitle: v.snippet.channelTitle,
        duration: v.contentDetails.duration,
        viewCount: v.statistics.viewCount,
        likeCount: v.statistics.likeCount,
        commentCount: v.statistics.commentCount
    }));
}

async function getPlaylistVideos() {

}

async function getPlaylistItems(sortedList) {
    return await Promise.all(
        sortedList.map(i => getPlaylistItemsPage(i.playlistId))
    )
    return await sortedList.map(i => getPlaylistItemsPage(i.id));
    //return [ await getPlaylistItemsPage(sortedList.items[0].playlistId)];
}

// TODO: Cleanup.
async function getSortedList() {
    console.log('Getting full sorted list.');
    let sortedList = await loadResource('sortedList');
    if (sortedList) {
        return sortedList;
    }

    // Get and format a list of the playlists.
    sortedList = await getPlaylistPage().then(formatPlaylists)

    // Get and format playlist deatils for each playlist item.
    const videoLists = await getPlaylistItems(sortedList)
    const formatedItems =  await formatPlaylistItems(videoLists);
 
    // Create a comma delimited string of videoIds and get the full video details for each video.
    //let videoIds = [];
    //formatedItems.forEach(pl => pl.forEach(v => videoIds.push(v.videoId)))
    


    let videoIds = formatedItems.map(i => i.videoId);
    let batchedIds = [];
    while(videoIds.length) {
        batchedIds.push(videoIds.splice(0,50));
    }

    let videoDetails = [];
    await Promise.all(
        batchedIds.map(batch => getVideoDetailsPage(batch.join(',')))
    ).then(results => results.forEach(r => r.forEach(i => videoDetails.push(i))));

    videoDetails = formatVideoList(videoDetails);

    //let videoDetails = await getVideoDetailsPage(.join(',')).then(formatVideoList);

    // Combine the video details with the playlist item details.
    videoDetails = videoDetails.map(v => ({
        ...v,
        ...formatedItems.find(i => i.videoId === v.videoId)
    }));

    // Add the videoList array to each playlist.
    sortedList = sortedList.map(pl => ({
        ...pl,
        videos: videoDetails.filter(vd => pl.playlistId === vd.playlistId)
    }));

    // Cache and return the results.
    await cacheResource('sortedList', { items: sortedList });
    return { items: sortedList };    
}

module.exports = { getSortedList }