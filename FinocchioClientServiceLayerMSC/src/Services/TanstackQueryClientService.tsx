import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import AuthenticationService from "@/Services/AuthenticationService";
import type { AuthenticatedSessionType } from "@/Types/AuthenticationType";

interface SignUpOrLoginVariablesType {
  email: string;
  password: string;
}

class AuthenticationMutations {
  public signUpMutation(): UseMutationResult<AuthenticatedSessionType, Error, SignUpOrLoginVariablesType> {
    return useMutation({
      mutationFn: ({ email, password }: SignUpOrLoginVariablesType) => AuthenticationService.current.signUp(email, password),
    });
  }

  public loginMutation(): UseMutationResult<AuthenticatedSessionType, Error, SignUpOrLoginVariablesType> {
    return useMutation({
      mutationFn: ({ email, password }: SignUpOrLoginVariablesType) => AuthenticationService.current.login(email, password),
    });
  }

  public logoutMutation(): UseMutationResult<void, Error, void> {
    return useMutation({
      mutationFn: () => AuthenticationService.current.logout(),
    });
  }

  public googleSignInMutation(): UseMutationResult<AuthenticatedSessionType, Error, string> {
    return useMutation({
      mutationFn: (idToken: string) => AuthenticationService.current.googleSignIn(idToken),
    });
  }
}

// Namespaces every domain's TanStack Query mutations/queries behind one
// singleton (e.g. .authentication.loginMutation()) -- matches the real
// pattern found in AssetSphere's own frontend, so it stays consistent as
// more features adopt TanStack Query.
export default class TanstackQueryClientService {
  public static current = new TanstackQueryClientService();

  public readonly authentication = new AuthenticationMutations();
}
