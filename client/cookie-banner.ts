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

interface ICookie {
  init: () => void;
  addCookie: () => void;
  hideCookieBanner: () => void;
  showCookieBanner: () => void;
  hideCookiesAccepted: () => void;
  showCookiesAccepted: () => void;
}

export default class CookieBanner implements ICookie {
  public cookieBanner: HTMLElement = null;
  public cookiePage: HTMLElement = null;
  public acceptAllCookies: HTMLElement = null;
  public allCookiesAccepted: HTMLElement = null;
  public hideAcceptedCookies: HTMLElement = null;

  init(): void {
    this.allCookiesAccepted = document.querySelector("#all-cookies-accepted");
    this.hideAcceptedCookies = document.querySelector("#hide-cookies-accepted");
    this.cookieBanner = document.querySelector("#cookie-banner");
    this.cookiePage = document.querySelector("#cookies-page");
    this.acceptAllCookies = document.querySelector("#accept-all-cookies");

    if (
      this.acceptAllCookies &&
      this.allCookiesAccepted &&
      this.hideAcceptedCookies
    ) {
      this.hideCookiesAccepted();
      this.acceptAllCookies.addEventListener(
        "click",
        function () {
          this.addCookie();
          this.showCookiesAccepted();
        }.bind(this)
      );
      this.hideAcceptedCookies.addEventListener(
        "click",
        function () {
          this.hideCookiesAccepted();
        }.bind(this)
      );
    }

    if (this.cookieBanner) {
      const setCookieExist =
        document.cookie.indexOf("consented-to-cookies=") > -1;
      if (setCookieExist || this.cookiePage) {
        this.hideCookieBanner();
      } else {
        this.showCookieBanner();
      }
    }
  }

  addCookie(): void {
    const currentDate = new Date();
    const expiryDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 12)
    );
    document.cookie = `consented-to-cookies={"usage":"true"}; expires=${expiryDate}; path=/`;
    this.hideCookieBanner();
  }

  hideCookieBanner(): void {
    this.cookieBanner.style.display = "none";
  }

  showCookieBanner(): void {
    this.cookieBanner.style.display = "block";
  }

  hideCookiesAccepted(): void {
    this.allCookiesAccepted.style.display = "none";
  }

  showCookiesAccepted(): void {
    this.allCookiesAccepted.style.display = "block";
  }
}
