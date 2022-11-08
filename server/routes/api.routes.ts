import { ExpressRequest, ExpressResponse } from '../models/rest.models';
import { ResourceLoader } from '../lib/resource';
import { ErrorQueueResource, HistoryResource, UnsortedVideosResource } from 'server/models/resource.models';
import { API } from '../lib/api';
import { SortLists } from '../lib/sort';
import { Playlist } from 'server/models/shared/list.model';

export class APIRoutes {

  public apply = (app: any, ensureAuth: any) => {
    
    app.get('/api/test', ensureAuth, (req: ExpressRequest, res: ExpressResponse) => {
      new ResourceLoader(req.user.id).getResource({ name: 'playlist', resourceId: 'PLLFJ6m60CtDwK9wca0UW4shViNd6-ti-7', bypassCache: true })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          console.log(e);
          res.status(404).json({ error: e });
        });   
        
      //res.json({ ...test });
    });
    
    app.get('/api/getResource/:resource', (req: ExpressRequest, res: ExpressResponse) => {
      const resource = req.params['resource'];
      console.log(`GET: /api/getResource/${resource}`);
      const rl = new ResourceLoader(req.user.id);
    
      rl.getResource({ name: resource })
        .then((contents: any) => {
          if (contents) {
            res.json(contents);
          } else {
            res.status(500).json({ error: `Unable to load resource: ${resource}` });
          }
        })
        .catch((e: any) => res.status(404).json({ error: e }));
    });
    
    app.get('/api/history/getHistory', async (req: ExpressRequest, res: ExpressResponse) => {
      console.log('GET: /api/history/getHistory');
      const rl = new ResourceLoader(req.user.id);
      const history: HistoryResource = <HistoryResource>await rl.getResource({ name: 'history' });
      const errorQueue: ErrorQueueResource = <ErrorQueueResource>await rl.getResource({ name: 'errorQueue' });
      const unsorted: UnsortedVideosResource = <UnsortedVideosResource>await rl.getResource({ name: 'unsortedVideos' });
      res.json({
        lastRun: history.lastUpdated,
        errorQueue: errorQueue.items,
        unsorted: unsorted.items
      });
    });
    
    app.get('/api/getChannelFeed/:id', (req: ExpressRequest, res: ExpressResponse) => {
      console.log('GET: /api/getChannelFeed/:id');
      const id = req.params['id'];
      const api = new API(req.user.id);
      api.getChannelFeed(id)
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
      const bypassCache = req.query['bypassCache'] === 'true';
      console.log(`GET: /api/getPlaylistFeed/${id}?bypassCache=${bypassCache}`);
      new ResourceLoader(req.user.id).getResource({ name: 'playlist', resourceId: id, bypassCache })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          console.log(e);
          res.status(404).json({ error: e });
        });       
    });
    
    app.get('/api/getLists', (req: ExpressRequest, res: ExpressResponse) => {
      const bypassCache = req.query['nocache'] === 'true';
      console.log(`GET /api/getLists?nocache=${bypassCache}`);
      //getSortedList(nocache).then((contents: any) => res.json(contents));
      /*
      new API(req.user.id).getPlaylists()
        .then((playlists: Playlist[]) => res.status(200).json({ items: playlists }))
        .catch((e: any) => res.status(404).json({ error: e }));
        */
      new ResourceLoader(req.user.id).getResource({ name: 'playlists', bypassCache })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          console.log(e);
          res.status(404).json({ error: e });
        }); 
    });
    
    app.put('/api/resources/updateRule', (req: ExpressRequest, res: ExpressResponse) => {
      console.log('PUT: /api/resources/updateRule');
      new ResourceLoader(req.user.id).updateResourceItem('rules', 'id', req.body.id, req.body)
        .then(() => {
          res.status(204).send();
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });

    app.delete('/api/resources/deleteRule/:id', (req: ExpressRequest, res: ExpressResponse) => {
      const id = req.params['id'];
      console.log(`DELETE: /api/resources/deleteRule/${id}`);
      new ResourceLoader(req.user.id).deleteResourceItem('rules', 'id', id)
        .then(() => {
          res.status(204).send();
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.post('/api/resources/addRule', (req: ExpressRequest, res: ExpressResponse) => {
      console.log('POST: /api/resources/addRule');
      new ResourceLoader(req.user.id).addResourceItem('rules', req.body)
        .then(() => {
          res.status(204).send();
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.post('/api/history/purgeUnsorted', (req: ExpressRequest, res: ExpressResponse) => {
      console.log('POST: /api/history/purgeUnsorted');
      new ResourceLoader(req.user.id).purgeResourceItem('unsortedVideos')
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e.code || 500).json({ error: e.message || e }));
    });
    
    app.post('/api/history/purgeErrors', (req: ExpressRequest, res: ExpressResponse) => {
      console.log('POST: /api/history/purgeErrors');
      new ResourceLoader(req.user.id).purgeResourceItem('errorQueue')
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e.code || 500).json({ error: e.message || e }));
    });
    
    app.post('/api/runSort', (req: ExpressRequest, res: ExpressResponse) => {
      console.log('POST: /api/runSort');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      const sl = new SortLists(req.user.id);
      sl.onStatus((status: string) => res.write(status));
      sl.loadAndSort().then(() =>  res.end());    
    });
    
    app.delete('/api/history/deleteUnsortedItem/:id', (req: ExpressRequest, res: ExpressResponse) => {
      const id = req.params['id'];
      console.log(`DELETE: /api/history/deleteUnsortedItem/${id}`);
      new ResourceLoader(req.user.id).deleteResourceItem('unsortedVideos', 'videoId', req.body.id)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.delete('/api/history/deleteErrorItem/:id', (req: ExpressRequest, res: ExpressResponse) => {
      const id = req.params['id'];
      console.log(`DELETE: /api/history/deleteErrorItem/${id}`);
      new ResourceLoader(req.user.id).deleteResourceItem('errorQueue', 'videoId', req.body.id)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.put('/api/video/:videoId/addToPlaylist/:playlistId', (req: ExpressRequest, res: ExpressResponse) => {
      const videoId = req.params['videoId'];
      const playlistId = req.params['playlistId'];
      console.log(`PUT: /api/video/${videoId}/addToPlaylist/${playlistId}`);
      new API(req.user.id).addToPlaylist(playlistId, videoId)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.put('/api/video/:videoId/rate/:rating?', (req: ExpressRequest, res: ExpressResponse) => {
      const videoId = req.params['videoId'];
      const rating = req.params['rating'] || '';
      console.log(`PUT: /api/video/${videoId}/rate/${rating}`);
      new API(req.user.id).rateVideo(videoId, rating)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.put('/api/playlistItem/remove/:playlistItemId', (req: ExpressRequest, res: ExpressResponse) => {
      const playlistItemId = req.params['playlistItemId'];
      console.log(`/api/playlistItem/remove/${playlistItemId}`);
      new API(req.user.id).removeVideo(playlistItemId)
        .then(() => {
          //removeVideoFromList(playlistItemId);
          res.send(204);
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.get('/api/getAuthState', (req: ExpressRequest, res: ExpressResponse) => {
      res.json({ authenticated: req.isAuthenticated() });
    });
  };
}
