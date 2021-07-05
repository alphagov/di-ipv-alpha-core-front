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

import * as govUK from "govuk-frontend";

import CookieBanner from "./cookie-banner";
import DropDownCheck from "./check-drop-down-attr";
import { Accordions } from "./accordion";
import TimeoutDialog from "./timeout-dialog/timeout-dialog";

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(
    targetLength: number,
    padString: string
  ) {
    targetLength = targetLength >> 0;
    if (this.length > targetLength) {
      return String(this);
    }
    padString = String(typeof padString !== "undefined" ? padString : " ");
    targetLength = targetLength - this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    return padString.slice(0, targetLength) + String(this);
  };
}

const ready = (callback: () => void): void => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

const initialize = (): void => {
  const cookies: CookieBanner = new CookieBanner();
  const ddCheck: DropDownCheck = new DropDownCheck();

  ddCheck.init();
  cookies.init();
  govUK.initAll();
  Accordions.initAll();
  const timeoutDialog = document.querySelector(
    'meta[name="hmrc-timeout-dialog"]'
  );
  if (timeoutDialog) {
    TimeoutDialog(timeoutDialog).init();
  }
};

export { initialize, ready };
