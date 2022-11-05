/* eslint-disable @typescript-eslint/no-var-requires */

import * as dotenv from 'dotenv';
// eslint-disable-next-line angular/module-getter
dotenv.config();

import { Request, Response } from 'express';
import { UserAuthentication } from './lib/auth';
import { UserAuthToken } from './models/auth.models';
import { ResourceLoader } from './lib/resource';
import { ServiceAccount } from 'firebase-admin';
import { cert }from 'firebase-admin/app';


const passport = require('passport');
const session = require('express-session');

const CLIENT_CREDENTIALS = {
  clientID: process.env['CLIENT_ID'],
  clientSecret: process.env['CLIENT_SECRET'],
  callbackURL: process.env['AUTH_REDIRECT'],
};

const FIREBASE_CREDENTIALS = <ServiceAccount>{
  type: 'service_account',
  project_id: process.env['PROJECT_ID'],
  private_key_id: process.env['PRIVATE_KEY_ID'],
  private_key: process.env['PRIVATE_KEY'],
  client_email: process.env['CLIENT_EMAIL'],
  client_id: process.env['SERVICE_CLIENT_ID'],
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env['CLIENT_X509_CERT_URL']
};

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






// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require('firebase-admin');
let firebase;
try {
  firebase = admin.initializeApp({ credential: cert(FIREBASE_CREDENTIALS) });
} catch (e) {
  firebase = admin.app();
}
const database = firebase.firestore();
// eslint-disable-next-line @typescript-eslint/naming-convention
const FirestoreStore = require('firestore-store')(session);





interface ExpressRequest extends Request {
  isAuthenticated(): boolean;
  session: any;
  logout(): void;
}

type ExpressResponse = Response

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






const express = require('express');
const { loadResource, purgeUnsorted, deleteUnsortedItem, addRule, updateRule, deleteRule, purgeErrors, deleteErrorItem } = require('./lib/resources');
const { getChannelFeed, getPlaylistFeed, addToPlaylist, rateVideo, removeVideo } = require('./lib/api-calls');
const app = express();
const port = 3000;
const { spawn } = require('child_process');
const { getSortedList, removeVideoFromList } = require('./lib/web.js');





const bodyParser = require('body-parser');
app.use(bodyParser.json({ extended: true }));



app.use(express.urlencoded({ extended:true }));
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    //store: new MongoStore({ mongooseConnection: mongoose.connection }),
    store: new FirestoreStore({
      database: database,
    }),
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




passport.use(
  new GoogleStrategy(
    CLIENT_CREDENTIALS,
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




app.get('/api/test', ensureAuth, (req: ExpressRequest, res: ExpressResponse) => {

  const userId = req.user.id;
  const loader = new ResourceLoader(userId);

  //const resource = loader.getResource('sortedList');
  loader.getResource({ name: 'rules' }).then(test => res.json(test));
    
  //res.json({ ...test });
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
