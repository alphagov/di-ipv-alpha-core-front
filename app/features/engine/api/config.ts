export const getGPG45ProfileAPI = (): string => {
  return (
    process.env.GPG45_PROFILE_API ||
    "https://di-ipv-gpg-45-engine.london.cloudapps.digital/calculate"
  );
};
