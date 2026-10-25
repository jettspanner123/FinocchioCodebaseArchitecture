import { Redirect } from "expo-router";
import React from "react";

import ApplicationRouteCON from "@/Constants/ApplicationRouteCON";
import useAuthenticationStateStore from "@/Store/AuthenticationStateStore";

// The single place that decides which stack (unauthenticated vs.
// authenticated) the app shows, based on auth state -- src/app/index.tsx is
// just a thin Expo-required entry point that renders this.
export default function RootViewController(): React.JSX.Element {
  const isAuthenticated = useAuthenticationStateStore((state) => state.isAuthenticated);

  return <Redirect href={isAuthenticated ? ApplicationRouteCON.DASHBOARD_SCREEN_ROUTE : ApplicationRouteCON.LOGIN_SCREEN_ROUTE} />;
}
