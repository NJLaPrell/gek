import { Request, Response } from 'express';

export interface ExpressRequest extends Request {
  isAuthenticated(): boolean;
  session: any;
  logout(): void;
  user: AuthUser;
}

export type ExpressResponse = Response;

export interface GoogleAuthProfile {
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
  };
}

export interface AuthUser {
  id: string;
  displayName: string;
}
