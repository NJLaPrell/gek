/* eslint-disable @typescript-eslint/no-var-requires */

import * as dotenv from 'dotenv';
// eslint-disable-next-line angular/module-getter
dotenv.config();

import { Request, Response } from 'express';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client';

import { UserAuthentication } from './lib/auth';
import { UserAuthToken } from './models/auth.models';

const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;

import { ResourceLoader } from './lib/resource';



//type ExpressRequest = Request

interface ExpressRequest extends Request {
  isAuthenticated(): boolean;
  session: any;
  logout(): void;
}

type ExpressResponse = Response

interface GoogleAuthCredentials {
  web: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
    javascript_origins: string[];
  };
}

interface GoogleAuthProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string | undefined;
    givenName: string;
  };
  emails: {
    value: string;
    verified: boolean;
  }[];
  photos: {
    value: string;
  }[];
  provider: string;
  _raw: string;
  _json: {
    sub: string;
    name: string;
    given_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    locale: string;
  }
}

interface AuthUser {
  id: string;
  displayName: string;
}




const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtubepartner',
  'https://www.googleapis.com/auth/youtubepartner-channel-audit',
  'profile',
  'email'
];

const express = require('express');
const { loadResource, purgeUnsorted, deleteUnsortedItem, addRule, updateRule, deleteRule, purgeErrors, deleteErrorItem, cacheCred } = require('./lib/resources');
const { getChannelFeed, getPlaylistFeed, addToPlaylist, rateVideo, removeVideo, authorize } = require('./lib/api-calls');
const app = express();
const port = 3000;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');
const { getSortedList, removeVideoFromList } = require('./lib/web.js');
//const cookieSession = require('cookie-session');
const {OAuth2Client} = require('google-auth-library');


const passport = require('passport')
const session = require('express-session')

const bodyParser = require('body-parser');
app.use(bodyParser.json({ extended: true }));

//app.use(cookieSession({
//  name: 'google-auth-session',
//  keys: ['key1', 'key2']
//}));

app.use(express.urlencoded({ extended:true }));
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    //store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

const ensureAuth = (req: ExpressRequest, res: ExpressResponse, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
};

const ensureGuest = (req: ExpressRequest, res: ExpressResponse, next: any) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
};


const GoogleStrategy = require('passport-google-oauth20').Strategy;

loadResource('credentials', true, false, true).then((creds: GoogleAuthCredentials) =>{
  //console.log(creds);
  const credentials = {
    clientID: creds.web.client_id,
    clientSecret: creds.web.client_secret,
    callbackURL: creds.web.redirect_uris[0],
  };

  passport.use(
    new GoogleStrategy(
      credentials,
      async (accessToken: string, refreshToken: string, profile: GoogleAuthProfile, done: any) => {
        console.log('  User authenticated.');
        
        const user: AuthUser = {
          id: profile.id,
          displayName: profile.displayName,
        };
        
        done(null, { user, refreshToken });
        
      }
    )
  );

  passport.serializeUser((userObj:any, done: any) => {
    console.log(userObj.user);
    process.nextTick(() => {
      console.log('  Caching user token.');
      const token = <UserAuthToken>{
        type: 'authorized_user',
        client_id: process.env['CLIENT_ID'],
        client_secret: process.env['CLIENT_SECRET'],
        refresh_token: userObj.refreshToken
      };

      const auth = new UserAuthentication(userObj.user.id);
      auth.cacheCredentials(token).then((success) => {
        console.log(`  Success: ${success}`);
        done(null, userObj.user);
      }).catch((e) => {
        console.log('  Success: false');
        console.log(e);
        done(null, userObj.user);
      });
    });
  });

  passport.deserializeUser((id: string, done: any) => {
    process.nextTick(() => {
      done(null, id);
    });
  });

  app.get('/auth', passport.authenticate('google', { failureRedirect: '/' }),  (req: ExpressRequest, res: ExpressResponse) => {
    res.redirect('/');
  });

  app.get('/login', passport.authenticate('google', { scope: SCOPES, accessType: 'offline', prompt: 'consent' }), (req: ExpressRequest, res: ExpressResponse) => {
    console.log('BAR', res);
    console.log(req);
  });

  app.get('/logout', (req: ExpressRequest, res: ExpressResponse) => {
    req.session = null;
    req.logout();
    res.redirect('/');
  });

});



app.get('/api/test', ensureAuth, (req: ExpressRequest, res: ExpressResponse) => {
  //const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc3Y2MwZWY0YzcxODFjZjRjMGRjZWY3YjYwYWUyOGNjOTAyMmM3NmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0NTgyOTQwNTkyMjItMzJ0NGEyZ3BqMHU1bmZwNmU5dnZhdGZpYnRpczY5aXYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0NTgyOTQwNTkyMjItMzJ0NGEyZ3BqMHU1bmZwNmU5dnZhdGZpYnRpczY5aXYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTAwOTMyNzU5MjQ4OTE4MTIwODIiLCJlbWFpbCI6InJ1c3R5anNoYWNrbGVmby02MDE1QHBhZ2VzLnBsdXNnb29nbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJWRGRDSW93bDBqZHQwQkJKOE1hWTRRIiwibmFtZSI6IlJ1c3R5SlNoYWNrbGVmb3JkIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FMbTV3dTFsVmVidWNjUWhEcmV1V294X3hSQ2Rpay1RbWNUX0FaSFhucWpRPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlJ1c3R5SlNoYWNrbGVmb3JkIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2Njc0MjE1MzQsImV4cCI6MTY2NzQyNTEzNH0.pNd3Xr07z7FWlXs9aVSv0BciP7BIaaglwxW2ws22vtHzaT5wgrjO2mlkWrJ81TOsvluwN0MNWjaXitT8HfHMQb2DqkkU_4Daa7t5m7HizRO_cBnndgTzuq0mbbjv4zZpx0AA3ybszyKjbJcNUcOrN9otCIXPf4X2z8hdv37FYCNzCMffbvYI5QGyGxxIFylEQZHXrEZvkZ9YyRjqKN47mW3MsBgVoEcuaJ7v9Pb0Z1rv8xJqUaTqTgLmo0SB_jo0mUozNSk2N6tzWfRZaWVzn5jtqSjfnJLzLjhAjvWKUbabLls4eZYIzj6Xs4TSStNkEQMmBtxWPB3Z_o5s8eYUYg";
  //authorize().then((client: OAuth2Client) => {
  //  client.getTokenInfo(token).then((resp:any) => console.log(resp));
        
  //});
  console.log(req);
  const userId = req.user.id;
  const loader = new ResourceLoader(userId);

  const resource = loader.getResource('sortedList');
    
  res.json({ ...resource });
});

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
    });
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
  const response = deleteUnsortedItem(id).then(res.status(204).send());
  //.catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.delete('/api/history/deleteErrorItem/:id', (req: ExpressRequest, res: ExpressResponse) => {
  const id = req.params['id'];
  console.log(`DELETE: /api/history/deleteErrorItem/${id}`);
  const response = deleteErrorItem(id).then(res.status(204).send());
  //.catch((e: any) => res.status(e.code).json({ error: e.message }));
});

app.put('/api/video/:videoId/addToPlaylist/:playlistId', (req: ExpressRequest, res: ExpressResponse) => {
  const videoId = req.params['videoId'];
  const playlistId = req.params['playlistId'];
  console.log(`PUT: /api/video/${videoId}/addToPlaylist/${playlistId}`);
  const response = addToPlaylist(playlistId, videoId).then(res.status(204).send());
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
  removeVideoFromList(playlistItemId);
  res.status(204).send();
});

app.get('/api/getAuthState', (req: ExpressRequest, res: ExpressResponse) => {
  res.json({ authenticated: req.isAuthenticated() });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
