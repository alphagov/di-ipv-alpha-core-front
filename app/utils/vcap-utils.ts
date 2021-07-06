const cfenv = require("cfenv");
const appEnv = cfenv.getAppEnv();

export const getRedisServiceUrl = (): string => {
  return appEnv.getServiceURL("session-cache");
};
