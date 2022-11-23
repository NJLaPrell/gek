import { ExpressRequest, ExpressResponse } from '../models/rest.models';
import { ResourceLoader } from '../lib/resource';
import { ErrorQueueResource, HistoryResource, UnsortedVideosResource } from 'server/models/resource.models';
import { API } from '../lib/api';
import { SortLists } from '../lib/sort';
import { Logger } from '../lib/logger';

const log = new Logger('rest');

export class APIRoutes {

  public apply = (app: any, ensureAuth: any) => {
    
    app.get('/api/test', ensureAuth, (req: ExpressRequest, res: ExpressResponse) => {
      new ResourceLoader(req.user.id, log).getResource({ name: 'playlist', resourceId: 'PLLFJ6m60CtDwK9wca0UW4shViNd6-ti-7', bypassCache: true })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          console.log(e);
          res.status(404).json({ error: e });
        });   
        
      //res.json({ ...test });
    });

    /********************************************************
     * 
     * RESOURCE ROUTES
     * 
     ********************************************************/
    
    app.get('/api/getResource/:resource', (req: ExpressRequest, res: ExpressResponse) => {
      const resource = req.params['resource'];
      log.debug(`GET: /api/getResource/${resource}`);
      const rl = new ResourceLoader(req.user.id, log);
    
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
      log.debug('GET: /api/history/getHistory');
      const rl = new ResourceLoader(req.user.id, log);
      const history: HistoryResource = <HistoryResource>await rl.getResource({ name: 'history' });
      const errorQueue: ErrorQueueResource = <ErrorQueueResource>await rl.getResource({ name: 'errorQueue' });
      const unsorted: UnsortedVideosResource = <UnsortedVideosResource>await rl.getResource({ name: 'unsortedVideos' });
      res.json({
        lastRun: history.lastUpdated,
        errorQueue: errorQueue.items,
        unsorted: unsorted.items
      });
    });

    app.put('/api/resources/updateRule', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('PUT: /api/resources/updateRule');
      new ResourceLoader(req.user.id, log).updateResourceItem('rules', 'id', req.body.id, req.body)
        .then(() => {
          res.status(204).send();
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });

    app.delete('/api/resources/deleteRule/:id', (req: ExpressRequest, res: ExpressResponse) => {
      const id = req.params['id'];
      log.debug(`DELETE: /api/resources/deleteRule/${id}`);
      new ResourceLoader(req.user.id, log).deleteResourceItem('rules', 'id', id)
        .then(() => {
          res.status(204).send();
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.post('/api/resources/addRule', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('POST: /api/resources/addRule');
      new ResourceLoader(req.user.id, log).addResourceItem('rules', req.body)
        .then(() => {
          res.status(204).send();
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.post('/api/history/purgeUnsorted', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('POST: /api/history/purgeUnsorted');
      new ResourceLoader(req.user.id, log).purgeResourceItem('unsortedVideos')
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e.code || 500).json({ error: e.message || e }));
    });
    
    app.post('/api/history/purgeErrors', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('POST: /api/history/purgeErrors');
      new ResourceLoader(req.user.id, log).purgeResourceItem('errorQueue')
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e.code || 500).json({ error: e.message || e }));
    });

    app.delete('/api/history/deleteUnsortedItem/:id', (req: ExpressRequest, res: ExpressResponse) => {
      const id = req.params['id'];
      log.debug(`DELETE: /api/history/deleteUnsortedItem/${id}`);
      new ResourceLoader(req.user.id, log).deleteResourceItem('unsortedVideos', 'videoId', req.body.id)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.delete('/api/history/deleteErrorItem/:id', (req: ExpressRequest, res: ExpressResponse) => {
      const id = req.params['id'];
      log.debug(`DELETE: /api/history/deleteErrorItem/${id}`);
      new ResourceLoader(req.user.id, log).deleteResourceItem('errorQueue', 'videoId', req.body.id)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });

    app.get('/api/preferences/getPreferences', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('GET: /api/preferences/getPreferences');
      new ResourceLoader(req.user.id, log).getResource({ name: 'preferences' })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          log.warn('Error getting user preference resource', e);
          res.status(404).json({ error: e });
        }); 
    });

    app.post('/api/preferences/setPreferences', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('POST: /api/preferences/setPreferences', req.body.items);
      new ResourceLoader(req.user.id, log).cacheResource('preferences', { lastUpdated: Date.now(), items: req.body.items })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          log.warn('Error saving user preference resource', e);
          res.status(404).json({ error: e });
        }); 
    });

    /********************************************************
     * 
     * SUBSCRIPTIONS
     * 
     ********************************************************/
    
    app.get('/api/getChannelFeed/:id', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('GET: /api/getChannelFeed/:id');
      const id = req.params['id'];
      const api = new API(req.user.id, log);
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

    /********************************************************
     * 
     * PLAYLISTS
     * 
     ********************************************************/
    
    app.get('/api/getPlaylistFeed/:id', (req: ExpressRequest, res: ExpressResponse) => {
      const id = req.params['id'];
      const bypassCache = req.query['bypassCache'] === 'true';
      log.debug(`GET: /api/getPlaylistFeed/${id}?bypassCache=${bypassCache}`);
      new ResourceLoader(req.user.id, log).getResource({ name: 'playlist', resourceId: id, bypassCache })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          log.warn('Error getting playlist feed resource', id, e);
          res.status(404).json({ error: e });
        });       
    });
    
    app.get('/api/getLists', (req: ExpressRequest, res: ExpressResponse) => {
      const bypassCache = req.query['nocache'] === 'true';
      log.debug(`GET /api/getLists?nocache=${bypassCache}`);
      new ResourceLoader(req.user.id, log).getResource({ name: 'playlists', bypassCache })
        .then((contents: any) => res.json(contents))
        .catch((e: any) => {
          log.warn('Error getting playlist list resource', e);
          res.status(404).json({ error: e });
        }); 
    });

    /********************************************************
     * 
     * VIDEOS
     * 
     ********************************************************/
    
    app.put('/api/video/:videoId/addToPlaylist/:playlistId', (req: ExpressRequest, res: ExpressResponse) => {
      const videoId = req.params['videoId'];
      const playlistId = req.params['playlistId'];
      log.debug(`PUT: /api/video/${videoId}/addToPlaylist/${playlistId}`);
      new API(req.user.id, log).addToPlaylist(playlistId, videoId)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.put('/api/video/:videoId/rate/:rating?', (req: ExpressRequest, res: ExpressResponse) => {
      const videoId = req.params['videoId'];
      const rating = req.params['rating'] || '';
      log.debug(`PUT: /api/video/${videoId}/rate/${rating}`);
      new API(req.user.id, log).rateVideo(videoId, rating)
        .then(() => res.status(204).send())
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    app.put('/api/playlistItem/remove/:playlistItemId', (req: ExpressRequest, res: ExpressResponse) => {
      const playlistItemId = req.params['playlistItemId'];
      log.debug(`/api/playlistItem/remove/${playlistItemId}`);
      new API(req.user.id, log).removeVideo(playlistItemId)
        .then(() => {
          res.send(204);
        })
        .catch((e: any) => res.status(e?.code || 500).json({ error: e?.message || e }));
    });
    
    /********************************************************
     * 
     * APP
     * 
     ********************************************************/

    app.post('/api/runSort', (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('POST: /api/runSort');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      const sl = new SortLists(req.user.id);
      sl.onStatus((status: string) => res.write(status));
      sl.loadAndSort().then(() =>  res.end());    
    });
    
    app.get('/api/getAuthState', (req: any, res: ExpressResponse) => {
      log.debug('GET: /api/getAuthState');
      res.cookie('XSRF-TOKEN', req.csrfToken, { httpOnly: false });
      res.json({ authenticated: req.isAuthenticated(), userId: req.user?.id || false, displayName: req.user?.displayName });
    });

  };
}
