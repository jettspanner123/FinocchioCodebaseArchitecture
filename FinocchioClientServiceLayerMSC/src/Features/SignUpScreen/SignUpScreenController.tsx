import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

import ApplicationRouteCON from "@/Constants/ApplicationRouteCON";
import SignUpScreenFormStaticComponent from "@/Features/SignUpScreen/Components/static/SignUpScreenFormStaticComponent";
import SignUpScreenCON from "@/Features/SignUpScreen/Constants/SignUpScreenCON";
import { signUpScreenFormResolver, type SignUpScreenFormDataModel } from "@/Features/SignUpScreen/Models/SignUpScreenModel";
import SignUpScreenService from "@/Features/SignUpScreen/Services/SignUpScreenService";
import TanstackQueryClientService from "@/Services/TanstackQueryClientService";

export default function SignUpScreenController(): React.JSX.Element {
  const form = useForm<SignUpScreenFormDataModel>({
    resolver: signUpScreenFormResolver,
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const signUpMutation = TanstackQueryClientService.current.authentication.signUpMutation();

  const onSubmit = form.handleSubmit((data) => {
    signUpMutation.mutate(data, {
      onSuccess: () => router.replace(ApplicationRouteCON.DASHBOARD_SCREEN_ROUTE),
    });
  });

  return (
    <View>
      <Text>{SignUpScreenCON.SCREEN_TITLE}</Text>

      <SignUpScreenFormStaticComponent form={form} />

      {signUpMutation.isError ? <Text>{SignUpScreenService.current.extractErrorMessage(signUpMutation.error)}</Text> : null}

      <Pressable onPress={onSubmit} disabled={signUpMutation.isPending}>
        <Text>{signUpMutation.isPending ? "Creating account..." : "Sign Up"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push(ApplicationRouteCON.LOGIN_SCREEN_ROUTE)}>
        <Text>Already have an account? Log in</Text>
      </Pressable>
    </View>
  );
}
