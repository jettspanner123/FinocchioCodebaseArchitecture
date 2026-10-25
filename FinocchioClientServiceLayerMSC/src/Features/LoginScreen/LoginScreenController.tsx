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
    <View>
      <Text>{LoginScreenCON.SCREEN_TITLE}</Text>

      <LoginScreenFormStaticComponent form={form} />

      {loginMutation.isError ? <Text>{LoginScreenService.current.extractErrorMessage(loginMutation.error)}</Text> : null}

      <Pressable onPress={onSubmit} disabled={loginMutation.isPending}>
        <Text>{loginMutation.isPending ? "Logging in..." : "Log In"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push(ApplicationRouteCON.SIGN_UP_SCREEN_ROUTE)}>
        <Text>Don&apos;t have an account? Sign up</Text>
      </Pressable>
    </View>
  );
}
