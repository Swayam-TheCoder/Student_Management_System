import { Platform } from 'react-native';
import { secureStorage } from './secureStorage';

const DEFAULT_LAN_IP = '10.46.187.163';
const BACKEND_PORT = '8080';

const CUSTOM_API_URL_KEY = 'sms_custom_api_url';

export const getDefaultBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}/api/v1`;
  }
  return `http://${DEFAULT_LAN_IP}:${BACKEND_PORT}/api/v1`;
};

export const getActiveBaseUrl = async (): Promise<string> => {
  const custom = await secureStorage.getCustomApiUrl();
  return custom || getDefaultBaseUrl();
};

export const API_BASE_URL = getDefaultBaseUrl();
