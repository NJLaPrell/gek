import { ExpressRequest, ExpressResponse } from 'server/models/rest.models';
import { Logger } from '../lib/logger';

const log = new Logger('rest');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'profile',
  'email'
];

export class AuthenticationRoutes {
  public apply = (app: any, passport: any, ensureGuest: any) => {

    app.get('/auth', passport.authenticate('google', { failureRedirect: '/' }),  (req: ExpressRequest, res: ExpressResponse) => {
      log.debug('/GET /auth');
      res.redirect('/');
    });
    
    app.get('/login', ensureGuest, passport.authenticate('google', { scope: SCOPES, accessType: 'offline', prompt: 'consent' }), () => {
      log.debug('GET: /login');
    });
    
    app.get('/logout', (req: ExpressRequest, res: ExpressResponse) => {
      const dataDeleted = req.query['dataDeleted'] === 'true';
      log.debug(`GET: /logout?dataDeleted=${dataDeleted}`);
      req.session.destroy(() => res.redirect(dataDeleted ? '/data-deleted' : '/'));
    });

  };
}
