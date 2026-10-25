import { create } from "zustand";

import type AuthenticationStateStoreInterface from "./Interface/AuthenticationStateStoreInterface";

// Access token lives here only -- in memory, not persisted. It's short-lived
// (15 minutes) and cheap to re-derive from the refresh token on cold start,
// so there's no need to put it in SecureStore alongside the refresh token.
const useAuthenticationStateStore = create<AuthenticationStateStoreInterface>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setSession: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  clearSession: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));

export default useAuthenticationStateStore;
