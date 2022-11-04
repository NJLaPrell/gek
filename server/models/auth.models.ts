export interface UserAuthToken {
  type: 'authorized_user',
  client_id: string;
  client_secret: string;
  refresh_token: string;
}
