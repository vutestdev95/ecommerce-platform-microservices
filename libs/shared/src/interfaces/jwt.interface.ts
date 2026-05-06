export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface JwtResponse {
  id: string;
  email: string;
  role: string;
}
