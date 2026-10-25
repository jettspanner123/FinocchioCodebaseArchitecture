import type { UserType } from "@/Types/AuthenticationType";

export default interface AuthenticationStateStoreInterface {
  accessToken: string | null;
  user: UserType | null;
  isAuthenticated: boolean;
  setSession: (accessToken: string, user: UserType) => void;
  clearSession: () => void;
}
