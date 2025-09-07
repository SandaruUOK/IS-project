import auth0 from 'auth0-js';
import { AUTH0_CONFIG } from './config.js';

class AuthService {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: 'dev-i6aizvtmrvtfols7.us.auth0.com',
      clientID: 'IdGx5OhSD4kQYzlUouzOaz3dhYXHRiuM',
      redirectUri: 'http://localhost:3000',
      responseType: 'token id_token',
      scope: AUTH0_CONFIG.scope,
     // audience: AUTH0_CONFIG.audience
      audience: 'http://dev-i6aizvtmrvtfols7.us.auth0.com/api/v2/'
    });
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve(authResult);
        } else if (err) {
          reject(err);
        }
      });
    });
  }

  setSession(authResult) {
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    
    this.auth0.logout({
      returnTo: window.location.origin,
      clientID: AUTH0_CONFIG.clientId
    });
  }

  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
    return new Date().getTime() < expiresAt;
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getIdToken() {
    return localStorage.getItem('id_token');
  }
}

export default new AuthService();