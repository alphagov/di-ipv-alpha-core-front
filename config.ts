// This is for the API authentication
import { getRedisServiceUrl } from "./app/utils/vcap-utils";

export const getRedisAuthToken = (): string => {
  return process.env.REDIS_AUTH_TOKEN;
};
export const getRedisSessionUrl = (): string => {
  return process.env.REDIS_SESSION_URL || getRedisServiceUrl();
};
export const getRedisSessionSecret = (): string => {
  return process.env.SESSION_SECRET;
};
export const getRedisPort = (): string => {
  return process.env.REDIS_PORT;
};
export const isSessionCookieSecure = (): boolean => {
  return process.env.SESSION_COOKIE_SECURE === "true";
};
export const getSessionCookieMaxAge = (): number => {
  return parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10);
};
export const shouldLogSession = (): boolean => {
  return process.env.LOG_SESSION === "true";
};
export const getLogFilePath = (): string => {
  return process.env.LOGS_FILE_PATH || "/logs.json";
};
export const getLogLevel = (): string => {
  return process.env.LOGS_LEVEL || "debug";
};
export const enableAnsiLog = (): boolean => {
  return process.env.ANSI_LOG === "true";
};
