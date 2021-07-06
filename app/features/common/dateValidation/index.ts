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

import { Request } from "express";
import { body, ValidationChain } from "express-validator";
import moment, { Moment } from "moment";

export const dateInputAsMoment = (year: any, month: any, day: any): Moment => {
  const dateStr =
    year.padStart(4, "0") +
    "-" +
    month.padStart(2, "0") +
    "-" +
    day.padStart(2, "0") +
    "T00:00:00.000Z";
  return moment(dateStr, "YYYY-MM-DD[T]HH:mm:SS.sssZ");
};

const isRealDate = async (
  year: any,
  month: any,
  day: any,
  req: Request,
  message: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (day < 1 || day > 31) {
      return reject(new Error(req.t(message)));
    }
    if (month < 1 || month > 12) {
      return reject(new Error(req.t(message)));
    }
    if (year.length !== 4) {
      return reject(new Error(req.t(message)));
    }
    const momentDate = dateInputAsMoment(year, month, day);
    if (!momentDate.isValid()) {
      return reject(new Error(req.t(message)));
    }
    return resolve("ok");
  });
};

export const dateValidation = (
  inputprefix: string,
  messagePrefix: string,
  customValidation?: any
): Array<ValidationChain> => {
  const validations = [
    body(inputprefix + "Year")
      .not()
      .isEmpty()
      .withMessage((value, { req }) => {
        return req.t(messagePrefix + ".emptyYear", {
          value,
        });
      }),
    body(inputprefix + "Month")
      .not()
      .isEmpty()
      .withMessage((value, { req }) => {
        if (!req.body[inputprefix + "Year"])
          return req.t(messagePrefix + ".emptyMonthAndYear", {
            value,
          });
        return req.t(messagePrefix + ".emptyMonth", {
          value,
        });
      }),
    body(inputprefix + "Day")
      .not()
      .isEmpty()
      .withMessage((value, { req }) => {
        if (!req.body[inputprefix + "Year"] && !req.body[inputprefix + "Month"])
          return req.t(messagePrefix + ".emptyDate", {
            value,
          });
        if (!req.body[inputprefix + "Month"])
          return req.t(messagePrefix + ".emptyDayAndMonth", {
            value,
          });
        if (!req.body[inputprefix + "Year"])
          return req.t(messagePrefix + ".emptyDayAndYear", {
            value,
          });
        return req.t(messagePrefix + ".emptyDay", {
          value,
        });
      })
      .custom(async (_, meta) => {
        const day = meta.req.body[inputprefix + "Day"];
        const month = meta.req.body[inputprefix + "Month"];
        const year = meta.req.body[inputprefix + "Year"];
        if (year && month && day) {
          return await isRealDate(
            year,
            month,
            day,
            meta.req as Request,
            messagePrefix + ".realDate"
          );
        }
        return true;
      })
      .custom(async (_, meta) => {
        const day = meta.req.body[inputprefix + "Day"];
        const month = meta.req.body[inputprefix + "Month"];
        const year = meta.req.body[inputprefix + "Year"];
        if (year && month && day && customValidation) {
          return new Promise((resolve, reject) => {
            try {
              customValidation(year, month, day, meta.req as Request);
              return resolve("ok");
            } catch (e) {
              reject(e);
            }
          });
        }
      }),
  ];

  return validations;
};
