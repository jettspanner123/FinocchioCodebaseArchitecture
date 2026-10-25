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
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center">{SignUpScreenCON.SCREEN_TITLE}</Text>

        <SignUpScreenFormStaticComponent form={form} />

        {signUpMutation.isError ? (
          <Text className="text-red-500 text-sm mb-2">{SignUpScreenService.current.extractErrorMessage(signUpMutation.error)}</Text>
        ) : null}

        <Pressable
          className="w-full items-center rounded-md bg-blue-600 px-4 py-3 mt-2 disabled:opacity-50"
          onPress={onSubmit}
          disabled={signUpMutation.isPending}
        >
          <Text className="text-white font-semibold">{signUpMutation.isPending ? "Creating account..." : "Sign Up"}</Text>
        </Pressable>

        <Pressable className="mt-4 items-center" onPress={() => router.push(ApplicationRouteCON.LOGIN_SCREEN_ROUTE)}>
          <Text className="text-blue-600">Already have an account? Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}
