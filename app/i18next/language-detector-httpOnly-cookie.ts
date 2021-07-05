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
const defaultCookie = "i18next";
const defaultLang = "en";
module.exports = {
  name: "httpOnlyCookie",
  lookup: function (req, res, options) {
    try {
      const rawCookies = req.headers.cookie.split("; ");
      const parsedCookies = {};
      rawCookies.forEach((rawCookie) => {
        const parsedCookie = rawCookie.split("=");
        parsedCookies[parsedCookie[0]] = parsedCookie[1];
      });
      return parsedCookies[options.lookupCookie || defaultCookie];
    } catch {
      return options.fallbackLng || defaultLang;
    }
  },
  cacheUserLanguage: function (req, res, lng, options) {
    // options -> are passed in options
    // lng -> current language, will be called after init and on changeLanguage
    // store it
    const expiresIn = 1000 * 24 * 60 * 60 * 365;
    res.cookie(
      options.lookupCookie || defaultCookie,
      lng || options.fallbackLng || defaultLang,
      {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
      }
    );
  },
};
