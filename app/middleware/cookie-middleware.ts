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
import { NextFunction, Request, Response } from "express";

export function fetchCookie(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    let consented_to_cookies = { usage: null };
    const rawCookies = req.headers.cookie;
    if (rawCookies) {
      const cookies = rawCookies.split("; ");
      cookies.forEach((element) => {
        if (element.startsWith("consented-to-cookies=")) {
          try {
            consented_to_cookies = JSON.parse(element.split("=")[1]);
          } catch (error) {
            res.cookie("consented-to-cookies", { maxAge: 0 });
          }
          return;
        }
      });
    }
    res.locals.consented_to_cookies = consented_to_cookies;
    next();
  } catch (e) {
    next(e);
  }
}
