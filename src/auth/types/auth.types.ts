export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  id: number;
  username: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}
