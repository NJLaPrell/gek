export interface AuthState {
    authenticated: boolean;
    access_token?: string;
    expiry_date?: number;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
  }