import { DataStore } from './data-store';
import { UserAuthToken } from 'server/models/auth.models';
import { google } from 'googleapis';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';

export class UserAuthentication {
  private userId: string;
  private store: DataStore;
  private authClient: JSONClient | false = false;
  private google = google;

  constructor(userId: string) {
    this.userId = userId;
    this.store = new DataStore(userId);
    this.getAuthClient();
  }

  private getCachedCredentials = (): Promise<UserAuthToken | false> => this.store.getUserAuthToken();

  public cacheCredentials = (credentials: UserAuthToken): Promise<boolean> => this.store.cacheUserAuthToken(credentials);

  public getAuthClient = async (): Promise<JSONClient | false> => {
    if (this.authClient) return this.authClient;

    return this.getCachedCredentials().then(cachedToken => {
      if (!cachedToken) return false;

      const authClient = google.auth.fromJSON(cachedToken, { forceRefreshOnFailure: true });
      if (authClient) {
        this.authClient = authClient;
        this.google.options({ auth: authClient });
        return this.authClient;
      } else {
        return false;
      }
    });
  };

  public isAuthenticated = (): boolean => this.authClient !== false;

  public revokeToken = () => {
    const client: any = this.google._options.auth;
    const token = client?.credentials?.refresh_token;
    if (token) {
      client.revokeToken(token);
    }
  };
}
