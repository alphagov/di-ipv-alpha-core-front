// This is for the API authentication
import { getRedisServiceUrl } from "./app/utils/vcap-utils";

export const getDeclarationApiDiscoveryUri = (): string => {
  return process.env.DISCOVERY_ENDPOINT;
};
export const getDeclarationApiClientId = (): string => {
  return process.env.AUTH_CLIENT_ID || process.env.CLIENT_ID;
};
export const getDeclarationApiClientSecret = (): string => {
  return process.env.CLIENT_SECRET;
};
export const getRedisAuthToken = (): string => {
  return process.env.REDIS_AUTH_TOKEN;
};
export const getRedisSessionUrl = (): string => {
  return getRedisServiceUrl() || process.env.REDIS_SESSION_URL;
};
export const getRedisSessionSecret = (): string => {
  return process.env.SESSION_SECRET;
};
export const getRedisPort = (): string => {
  return process.env.REDIS_PORT;
};
export const jwtSecret = (): string => {
  return process.env.TOKEN_SECRET;
};
export const isSessionCookieSecure = (): boolean => {
  return process.env.SESSION_COOKIE_SECURE === "true";
};
export const getSessionCookieMaxAge = (): number => {
  return parseInt(process.env.SESSION_COOKIE_MAX_AGE, 10);
};
export const getServiceApiEndpoint = (): string => {
  const endpoint = process.env.API_ENDPOINT || "";
  return endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
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

export const useAPI = (): boolean => {
  return false;
};
