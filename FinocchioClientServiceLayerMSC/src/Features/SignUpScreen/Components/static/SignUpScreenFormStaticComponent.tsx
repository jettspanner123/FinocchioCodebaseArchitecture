import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

import type { SignUpScreenFormDataModel } from "@/Features/SignUpScreen/Models/SignUpScreenModel";

interface SignUpScreenFormStaticComponentProps {
  form: UseFormReturn<SignUpScreenFormDataModel>;
}

export default function SignUpScreenFormStaticComponent({ form }: SignUpScreenFormStaticComponentProps): React.JSX.Element {
  const { control, formState } = form;

  return (
    <View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {formState.errors.email ? <Text>{formState.errors.email.message}</Text> : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput placeholder="Password" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />
      {formState.errors.password ? <Text>{formState.errors.password.message}</Text> : null}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput placeholder="Confirm Password" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
        )}
      />
      {formState.errors.confirmPassword ? <Text>{formState.errors.confirmPassword.message}</Text> : null}
    </View>
  );
}
