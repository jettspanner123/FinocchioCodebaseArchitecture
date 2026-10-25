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
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="w-full max-w-sm items-center">
        <Text className="text-lg mb-6 text-center">
          {DashboardScreenCON.LOGGED_IN_AS_PREFIX} {user?.Email}
        </Text>

        <Pressable
          className="w-full items-center rounded-md bg-blue-600 px-4 py-3 disabled:opacity-50"
          onPress={onLogout}
          disabled={logoutMutation.isPending}
        >
          <Text className="text-white font-semibold">{logoutMutation.isPending ? "Logging out..." : "Log Out"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
