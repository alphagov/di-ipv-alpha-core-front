/*!
 * MIT License
 *
 * Copyright (c) 2021 Government Digital Service
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const pathName = {
  public: {
    oauth2: {
      AUTHORIZE: "/oauth2/authorize",
      TOKEN: "/oauth2/token",
      USER_INFO: "/oauth2/userinfo",
      JWKS: "/.well-known/jwks.json",
    },
    ATTRIBUTES: "/attributes",
    PASSPORT_START: "/passport",
    CURRENT_ACCOUNT_LAST_OPENED: "/bank-account",
    CURRENT_ACCOUNT_CVV: "/bank-account/cvv",
    CURRENT_ACCOUNT_MORTGAGE: "/bank-account/mortgage",
    CURRENT_ACCOUNT_POSTCODE: "/bank-account/postcode",
    DRIVING_LICENCE_START: "/driving-licence",
    JSON: "/json",
    INFO: "/information",
    IPV: "/ipv",
    RETURN: "/ipv/return",
    HOME: "/ipv/home",
    NEXT: "/ipv/next",
    ACCESSIBILITY_STATEMENT: "/accessibility",
    TERMS_AND_CONDITIONS: "/terms-and-conditions",
    PRIVACY_POLICY: "/privacy",
    COOKIES: "/cookies",
    GA_DATA_LAYER_JS: "/gaDataLayer.js",
    EXTEND_SESSION: "/extend-session",
    TIMEOUT_SESSION: "/timeout-session",
    SIGNOUT_SESSION: "/signout-session",
    TIMEOUT: "/timeout",
    FORBIDDEN: "/forbidden",
    ERROR400: "/error/400",
    ERROR404: "/error/404",
    ERROR500: "/error/500",
  },
  tracked: {
    LOGGED_IN: "/logged-in",
  },
};

export { pathName };
