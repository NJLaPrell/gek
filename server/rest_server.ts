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
const passport = require('passport');
const session = require('express-session');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

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
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
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


// eslint-disable-next-line @typescript-eslint/naming-convention
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

// Apply routes
const routes = new Routes(app, passport, ensureAuth, ensureGuest);
routes.apply();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}).catch((e: any) => {
  console.log('EXCEPTION:');
  console.log(e);
});
