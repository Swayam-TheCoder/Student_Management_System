import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'sms_auth_token';
const THEME_KEY = 'sms_theme_mode';
const API_URL_KEY = 'sms_custom_api_url';

export const secureStorage = {
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Failed to save token to secure storage', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('Failed to get token from secure storage', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to remove token from secure storage', e);
    }
  },

  async saveTheme(theme: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(THEME_KEY, theme);
      } else {
        await SecureStore.setItemAsync(THEME_KEY, theme);
      }
    } catch (e) {
      console.warn('Failed to save theme', e);
    }
  },

  async getTheme(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(THEME_KEY);
      }
      return await SecureStore.getItemAsync(THEME_KEY);
    } catch (e) {
      return null;
    }
  },

  async saveCustomApiUrl(url: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(API_URL_KEY, url);
      } else {
        await SecureStore.setItemAsync(API_URL_KEY, url);
      }
    } catch (e) {
      console.warn('Failed to save custom API URL', e);
    }
  },

  async getCustomApiUrl(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(API_URL_KEY);
      }
      return await SecureStore.getItemAsync(API_URL_KEY);
    } catch (e) {
      return null;
    }
  },
};
