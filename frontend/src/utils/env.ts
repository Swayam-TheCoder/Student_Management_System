import { Platform } from 'react-native';
import { secureStorage } from './secureStorage';

const BACKEND_PORT = '8080';
const DEFAULT_FALLBACK_LAN_IP = '10.46.187.163';

export const getDefaultBaseUrl = (): string => {
  // 1. If explicit environment variable is provided, respect it
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser: use localhost directly
  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}/api/v1`;
  }

  // 3. Native mobile: use LAN IP or configurable IP
  const lanIp = process.env.EXPO_PUBLIC_LAN_IP || DEFAULT_FALLBACK_LAN_IP;
  return `http://${lanIp}:${BACKEND_PORT}/api/v1`;
};

export const getActiveBaseUrl = async (): Promise<string> => {
  const custom = await secureStorage.getCustomApiUrl();
  return custom || getDefaultBaseUrl();
};

export const API_BASE_URL = getDefaultBaseUrl();
