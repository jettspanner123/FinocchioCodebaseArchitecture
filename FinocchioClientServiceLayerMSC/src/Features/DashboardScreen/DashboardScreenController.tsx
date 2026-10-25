import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import ApplicationRouteCON from "@/Constants/ApplicationRouteCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import TanstackQueryClientService from "@/Services/TanstackQueryClientService";
import useAuthenticationStateStore from "@/Store/AuthenticationStateStore";

export default function DashboardScreenController(): React.JSX.Element {
  const user = useAuthenticationStateStore((state) => state.user);
  const logoutMutation = TanstackQueryClientService.current.authentication.logoutMutation();

  const onLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => router.replace(ApplicationRouteCON.LOGIN_SCREEN_ROUTE),
    });
  };

  return (
    <View>
      <Text>
        {DashboardScreenCON.LOGGED_IN_AS_PREFIX} {user?.Email}
      </Text>

      <Pressable onPress={onLogout} disabled={logoutMutation.isPending}>
        <Text>{logoutMutation.isPending ? "Logging out..." : "Log Out"}</Text>
      </Pressable>
    </View>
  );
}
