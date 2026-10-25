import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

import type { LoginScreenFormDataModel } from "@/Features/LoginScreen/Models/LoginScreenModel";

interface LoginScreenFormStaticComponentProps {
  form: UseFormReturn<LoginScreenFormDataModel>;
}

export default function LoginScreenFormStaticComponent({ form }: LoginScreenFormStaticComponentProps): React.JSX.Element {
  const { control, formState } = form;

  return (
    <View className="w-full">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full rounded-md border border-gray-300 px-3 py-2 mb-2"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {formState.errors.email ? <Text className="text-red-500 text-sm mb-2">{formState.errors.email.message}</Text> : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full rounded-md border border-gray-300 px-3 py-2 mb-2"
            placeholder="Password"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {formState.errors.password ? <Text className="text-red-500 text-sm mb-2">{formState.errors.password.message}</Text> : null}
    </View>
  );
}
