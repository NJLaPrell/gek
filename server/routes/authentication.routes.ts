import { ExpressRequest, ExpressResponse } from 'server/models/rest.models';

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

export class AuthenticationRoutes {
  public apply = (app: any, passport: any, ensureGuest: any) => {

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

  };
}
