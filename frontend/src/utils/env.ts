import { Platform } from 'react-native';

// Development machine LAN IP detected from network interface
const DEV_LAN_IP = '10.46.187.163';
const BACKEND_PORT = '8080';

export const API_BASE_URL =
  Platform.OS === 'web'
    ? `http://localhost:${BACKEND_PORT}/api/v1`
    : `http://${DEV_LAN_IP}:${BACKEND_PORT}/api/v1`;

export const getBaseUrl = (): string => API_BASE_URL;

