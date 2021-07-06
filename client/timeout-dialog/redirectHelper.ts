/* eslint-disable prettier/prettier */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function RedirectHelper(): any { }

RedirectHelper.redirectToUrl = (url) => {
  // This exists to make redirects more testable
  window.location.href = url;
};

export default RedirectHelper;
