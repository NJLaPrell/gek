/* eslint-disable @typescript-eslint/no-var-requires */

import * as dotenv from 'dotenv';
// eslint-disable-next-line angular/module-getter
dotenv.config();

import { ExpressRequest, ExpressResponse, AuthUser, GoogleAuthProfile } from './models/rest.models';
import { UserAuthentication } from './lib/auth';
import { UserAuthToken } from './models/auth.models';
import { ServiceAccount } from 'firebase-admin';
import { cert } from 'firebase-admin/app';
import { Routes } from './routes';
import { Logger } from './lib/logger';
import * as https from 'https';
const passport = require('passport');
const session = require('express-session');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const log = new Logger('rest');

/**
 * Google Auth Token
 */
const CLIENT_CREDENTIALS = {
  clientID: process.env['CLIENT_ID'],
  clientSecret: process.env['CLIENT_SECRET'],
  callbackURL: process.env['AUTH_REDIRECT'],
};

/**
 * Firebase Auth Details
 */
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


// Initialize firebase and set it up to be used as the store for the 
// express-session.
let firebase;
try {
  firebase = admin.initializeApp({ credential: cert(FIREBASE_CREDENTIALS) });
} catch (e) {
  firebase = admin.app();
}
const database = firebase.firestore();
// eslint-disable-next-line @typescript-eslint/naming-convention
const FirestoreStore = require('firestore-store')(session);

// Initialize Express
const app = express();
const port = 3000;

app.use(bodyParser.json({ extended: true }));
app.use(express.urlencoded({ extended:true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env['SESSION_SECRET'],
    resave: false,
    saveUninitialized: false,
    store: new FirestoreStore({
      database: database,
    }),
  })
);

// Rate Limiter Middleware
const limiter = rateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 200
});
app.use(limiter);

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

// eslint-disable-next-line @typescript-eslint/naming-convention
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    CLIENT_CREDENTIALS,
    async (accessToken: string, refreshToken: string, profile: GoogleAuthProfile, done: any) => {
      log.debug(`  User authenticated - ${profile.displayName}`);
      const user: AuthUser = {
        id: profile.id,
        displayName: profile.displayName,
      };
      done(null, { user, refreshToken });
    }
  )
);

passport.serializeUser((userObj:any, done: any) => {
  log.debug(userObj.user);
  process.nextTick(() => {
    log.debug('  Caching user token.');
    const token = <UserAuthToken>{
      type: 'authorized_user',
      client_id: process.env['CLIENT_ID'],
      client_secret: process.env['CLIENT_SECRET'],
      refresh_token: userObj.refreshToken
    };

    const auth = new UserAuthentication(userObj.user.id);
    auth.cacheCredentials(token).then((success) => {
      log.debug(`  Success: ${success}`);
      done(null, userObj.user);
    }).catch((e) => {
      log.debug('  Success: false');
      log.warn('Error caching credentials', e);
      done(null, userObj.user);
    });
  });
});

passport.deserializeUser((id: string, done: any) => {
  process.nextTick(() => {
    done(null, id);
  });
});

//app.use(csrf({ cookie: true }));

// Apply routes
const routes = new Routes(app, passport, ensureAuth, ensureGuest);
routes.apply();

// Use SSL if available
if (process.env['SSL_CERT'] && process.env['SSL_KEY'] && process.env['SSL_CA']) {
  const options = { 
    key: Buffer.from(process.env['SSL_KEY'], 'base64').toString('ascii'),
    cert: Buffer.from(process.env['SSL_CERT'], 'base64').toString('ascii'),
    ca: Buffer.from(process.env['SSL_CA'], 'base64').toString('ascii') 
  };
  
  https.createServer(options, app).listen(port, function(){
    log.info(`Express server listening on port ${port}`);
    log.info(' ');
  });
} else {
  app.listen(port, () => {
    log.info(`Server listening on port ${port}`);
    log.info(' ');
  });
}
