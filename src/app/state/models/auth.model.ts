export interface AuthState {
    authenticated?: boolean;
    userId: string | false;
    displayName: string;
  }