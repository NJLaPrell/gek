import { AuthenticationRoutes } from './authentication.routes';
import { APIRoutes } from './api.routes';

export class Routes {
  app;
  passport;
  ensureAuth;
  ensureGuest;

  authRoutes: AuthenticationRoutes = new AuthenticationRoutes();
  apiRoutes: APIRoutes = new APIRoutes();

  constructor(app: any, passport: any, ensureAuth: any, ensureGuest: any) {
    this.app = app;
    this.passport = passport;
    this.ensureAuth = ensureAuth;
    this.ensureGuest = ensureGuest;
  }
  public apply = () => {
    this.authRoutes.apply(this.app, this.passport, this.ensureGuest);
    this.apiRoutes.apply(this.app, this.ensureAuth);
  };
}
