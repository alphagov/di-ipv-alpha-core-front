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
import { validationResult } from "express-validator";

export const validationErrorFormatter = ({
  msg,
  param,
}: {
  msg: string;
  param: string;
}): any => {
  return {
    text: msg,
    href: `#${param}`,
  };
};

export const bodyValidate = (
  template: string,
  data: (
    session?: Express.Session,
    body?: Body,
    req?: Request
  ) => any = undefined
) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();
    const params = {
      errors,
      errorList: Object.values(errors),
      ...req.body,
      ...(data && {
        ...data(req.session, req.body, req),
      }),
    };
    if (Object.keys(errors).length !== 0) {
      return res.render(template, params);
    }
    next();
  };
};

export const testValidatorMiddleware = async (
  req: any,
  res: any,
  middlewares: any
): Promise<any> => {
  await Promise.all(
    middlewares.map(async (middleware) => {
      await middleware(req, res, () => undefined);
    })
  );
  return validationResult(req).array();
};
