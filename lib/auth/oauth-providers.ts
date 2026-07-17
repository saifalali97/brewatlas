/** When true, the Apple Sign In button is shown on login and signup. */
export function isAppleOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === "true";
}
