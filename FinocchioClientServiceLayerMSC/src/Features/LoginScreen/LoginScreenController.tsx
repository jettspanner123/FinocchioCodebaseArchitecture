import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

import ApplicationRouteCON from "@/Constants/ApplicationRouteCON";
import LoginScreenFormStaticComponent from "@/Features/LoginScreen/Components/static/LoginScreenFormStaticComponent";
import LoginScreenCON from "@/Features/LoginScreen/Constants/LoginScreenCON";
import { loginScreenFormResolver, type LoginScreenFormDataModel } from "@/Features/LoginScreen/Models/LoginScreenModel";
import LoginScreenService from "@/Features/LoginScreen/Services/LoginScreenService";
import TanstackQueryClientService from "@/Services/TanstackQueryClientService";

export default function LoginScreenController(): React.JSX.Element {
  const form = useForm<LoginScreenFormDataModel>({
    resolver: loginScreenFormResolver,
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = TanstackQueryClientService.current.authentication.loginMutation();

  const onSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: () => router.replace(ApplicationRouteCON.DASHBOARD_SCREEN_ROUTE),
    });
  });

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center">{LoginScreenCON.SCREEN_TITLE}</Text>

        <LoginScreenFormStaticComponent form={form} />

        {loginMutation.isError ? (
          <Text className="text-red-500 text-sm mb-2">{LoginScreenService.current.extractErrorMessage(loginMutation.error)}</Text>
        ) : null}

        <Pressable
          className="w-full items-center rounded-md bg-blue-600 px-4 py-3 mt-2 disabled:opacity-50"
          onPress={onSubmit}
          disabled={loginMutation.isPending}
        >
          <Text className="text-white font-semibold">{loginMutation.isPending ? "Logging in..." : "Log In"}</Text>
        </Pressable>

        <Pressable className="mt-4 items-center" onPress={() => router.push(ApplicationRouteCON.SIGN_UP_SCREEN_ROUTE)}>
          <Text className="text-blue-600">Don&apos;t have an account? Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}
