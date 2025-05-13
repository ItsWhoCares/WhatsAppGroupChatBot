import dotenv from 'dotenv';
dotenv.config();

/** @module config */
export const AUTH_PATH = process.env.WHAUTH_PATH || './auth_info';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
