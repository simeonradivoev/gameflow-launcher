export interface IRedditAuthAccessToken {
  access_token: string;
  token_type: string;
  device_id: string;
  // The date in seconds it will expire in
  expires_in: number;
  scope: string;
}
