import { getPlaylistPage, getPlaylistItemsPage, getVideoDetailsPage } from '../api';

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
    viewCount: v.statistics.viewCount || 0,
    likeCount: v.statistics.likeCount || 0,
    commentCount: v.statistics.commentCount || 0
  }));
}

async function getPlaylistItems(userId: string, sortedList) {
  return await Promise.all(
    sortedList.map(i => getPlaylistItemsPage(userId, i.playlistId))
  );
}

// TODO: Cleanup.
export const getSortedList = async (userId: string) => {
  console.log('Getting full sorted list.');
  let sortedList;   

  // Get and format a list of the playlists.
  sortedList = await getPlaylistPage(userId).then(formatPlaylists);

  console.log(`Got ${sortedList.length} playlists.`);

  // Get and format playlist deatils for each playlist item.
  const videoLists = await getPlaylistItems(userId, sortedList);
  console.log(`Got ${videoLists.length} videoLists.`);
  const formatedItems =  await formatPlaylistItems(videoLists);
 
  const videoIds = formatedItems.map(i => i.videoId);
  const batchedIds = [];
  while(videoIds.length) {
    batchedIds.push(videoIds.splice(0,50));
  }

  let videoDetails = [];
  await Promise.all(
    batchedIds.map(batch => getVideoDetailsPage(userId, batch))
  ).then(results => results.forEach(r => r.forEach(i => videoDetails.push(i))));

  videoDetails = formatVideoList(videoDetails);

  console.log(`Got ${videoDetails.length} videoDetails.`);
  // Combine the video details with the playlist item details.
  videoDetails = videoDetails.map(v => ({
    ...v,
    ...formatedItems.find(i => i.videoId === v.videoId)
  }));

  // Add the videoList array to each playlist.
  sortedList = sortedList.map(pl => ({
    ...pl,
    newItemCount: videoDetails.filter(vd => pl.playlistId === vd.playlistId && new Date(vd.publishedAt) > Date.now() - 86400000).length,
    videos: videoDetails.filter(vd => pl.playlistId === vd.playlistId)
  }));

  console.log(sortedList);
  
  return { items: sortedList };    
};

