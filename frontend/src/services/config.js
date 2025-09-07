export const AUTH0_CONFIG = {
  domain: import.meta.env.REACT_APP_AUTH0_DOMAIN,
  clientId: import.meta.env.REACT_APP_AUTH0_CLIENT_ID,
  redirectUri: import.meta.env.REACT_APP_REDIRECT_URI || window.location.origin,
  audience: import.meta.env.REACT_APP_AUTH0_AUDIENCE,
  scope: 'openid profile email'
};

export const API_CONFIG = {
  baseURL: import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'
};