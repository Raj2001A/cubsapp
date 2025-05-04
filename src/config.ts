/**
 * Application Configuration
 *
 * This file centralizes all environment variables and configuration settings.
 * In Vite, we use import.meta.env instead of process.env
 */

import { getEnv } from './utils/env';

// Environment detection
export const IS_DEVELOPMENT = getEnv('VITE_DEV', '') === 'true';
export const IS_PRODUCTION = getEnv('VITE_PROD', '') === 'true';

// Toggle for using mock backend
export const USE_MOCK_BACKEND = getEnv('VITE_USE_MOCK_BACKEND', '') === 'true';

// API configuration
export const API_BASE_URL = getEnv('VITE_API_URL', 'http://localhost:5002/api');
export const API_ENDPOINT = API_BASE_URL;

// Firebase configuration
export const FIREBASE = {
  API_KEY: getEnv('VITE_FIREBASE_API_KEY'),
  AUTH_DOMAIN: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  PROJECT_ID: getEnv('VITE_FIREBASE_PROJECT_ID'),
  STORAGE_BUCKET: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  MESSAGING_SENDER_ID: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  APP_ID: getEnv('VITE_FIREBASE_APP_ID'),
  USE_EMULATORS: getEnv('VITE_USE_FIREBASE_EMULATORS', '') === 'true'
};

// Email configuration
export const EMAIL = {
  SMTP_HOST: getEnv('VITE_SMTP_HOST', ''),
  SMTP_PORT: parseInt(getEnv('VITE_SMTP_PORT', '587')),
  SMTP_USER: getEnv('VITE_SMTP_USER', ''),
  SMTP_PASS: getEnv('VITE_SMTP_PASS', ''),
  FROM_EMAIL: getEnv('VITE_FROM_EMAIL', '')
};

// Backblaze B2 configuration
export const B2_STORAGE = {
  KEY_ID: getEnv('VITE_B2_KEY_ID', ''),
  APPLICATION_KEY: getEnv('VITE_B2_APPLICATION_KEY', ''),
  BUCKET_ID: getEnv('VITE_B2_BUCKET_ID', '')
};

// WebSocket configuration
export const WS_URL = getEnv('VITE_WS_URL', 'ws://localhost:5002/ws');

// Other configuration constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
