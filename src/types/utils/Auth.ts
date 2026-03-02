/**
 * Options for the useAuth hook.
 */
export interface UseAuthOptions {
  /** Path to redirect to if the user is already logged in. */
  redirectIfLoggedIn?: string;
  /** Path to redirect to if the user is not logged in. */
  redirectIfLoggedOut?: string;
}
