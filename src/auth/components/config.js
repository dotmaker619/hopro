const { VUE_APP_OKTA_ISSUER, VUE_APP_OKTA_CLIENT_ID } = process.env

export default {
  oidc: {
    clientId: VUE_APP_OKTA_CLIENT_ID,
    issuer: VUE_APP_OKTA_ISSUER,
    redirectUri: location.origin + '/auth/callback',
    scopes: ['openid', 'offline_access', 'email', "profile"],
    pkce: false
  }
}