/**
 * Universal environment variable getter for frontend (Vite/Astro) and backend (Node.js).
 * Use this to safely access environment variables regardless of runtime.
 *
 * Example:
 *   import { getEnv } from './env';
 *   const API_URL = getEnv('VITE_API_URL', 'http://localhost:5002/api');
 */
export function getEnv(key: string, fallback = ''): string {
  // Vite/Astro: import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    return (import.meta.env as any)[key] ?? fallback;
  }
  // Node.js: process.env
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key] ?? fallback;
  }
  return fallback;
}
