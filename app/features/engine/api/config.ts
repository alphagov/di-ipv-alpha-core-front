export const getBackendServiceApiEndpoint = (): string => {
  const endpoint = process.env.DI_IPV_CORE_BACK_API_ENDPOINT;
  return endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
};
