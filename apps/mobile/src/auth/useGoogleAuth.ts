import { useMemo } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export function useGoogleAuth() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const nonce = useMemo(() => Math.random().toString(36).slice(2), []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId ?? '',
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: { nonce },
    },
    discovery
  );

  return { request, response, promptAsync, isConfigured: Boolean(clientId) };
}
