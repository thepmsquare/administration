import * as React from "react";

import { navigate } from "gatsby";

import { User, UserZ } from "../types/Common";
import { UseAuthOptions } from "../types/utils/Auth";
import {
  authenticationAdministrationBL,
  authenticationCommonBL,
} from "./initialiser";

/**
 * A hook to handle authentication status checks and redirections.
 *
 * @param initialUser - Optional initial user state (usually from location.state).
 * @param options - Configuration for redirections.
 * @returns An object containing the current user, loading state, error, and a function to update the user.
 */
export const useAuth = (
  initialUser?: User | null,
  options: UseAuthOptions = {},
) => {
  const { redirectIfLoggedIn, redirectIfLoggedOut } = options;
  const [user, setUser] = React.useState<User | null>(initialUser || null);
  const [isLoading, setIsLoading] = React.useState<boolean>(!initialUser);
  const [error, setError] = React.useState<Error | null>(null);

  // Use a ref to prevent effects from running if the component unmounts
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const checkAuth = React.useCallback(async () => {
    // If we already have a user, handle redirectIfLoggedIn if applicable
    if (user) {
      if (redirectIfLoggedIn) {
        await navigate(redirectIfLoggedIn, { state: { user } });
      }
      if (isMounted.current) {
        setIsLoading(false);
      }
      return;
    }

    try {
      // 1. Attempt to generate an access token
      const accessTokenResponse =
        await authenticationAdministrationBL.generateAccessTokenV0();
      const accessToken = accessTokenResponse.data.main.access_token;

      // 2. Fetch user details using the access token
      const userDetailsResponse =
        await authenticationCommonBL.getUserDetailsV0(accessToken);
      const { username, user_id } = userDetailsResponse.data.main;

      // 3. Validate and build the user object
      const authenticatedUser = UserZ.parse({
        user_id,
        username,
        access_token: accessToken,
      });

      if (isMounted.current) {
        setUser(authenticatedUser);
        setError(null);
      }

      // 4. Handle redirect if already logged in
      if (redirectIfLoggedIn) {
        await navigate(redirectIfLoggedIn, {
          state: { user: authenticatedUser },
        });
      }
    } catch (e) {
      if (isMounted.current) {
        setError(e as Error);
        setUser(null);
      }

      // 5. Handle redirect if logged out
      if (redirectIfLoggedOut) {
        await navigate(redirectIfLoggedOut);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [user, redirectIfLoggedIn, redirectIfLoggedOut]);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { user, isLoading, error, setUser };
};
