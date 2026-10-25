export interface UserType {
  Id: number;
  Email: string;
}

export interface AuthenticatedSessionType {
  User: UserType;
  AccessToken: string;
  RefreshToken: string;
}
