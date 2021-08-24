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
import hashSessionId from "../utils/hashSessionId";

import Logger from "../utils/logger";

const errorMiddlewareLabel = "logErrorMiddleware";
const requestMiddlewareLabel = "logRequestMiddleware";

const logRequestMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    req.app.locals.knownPaths &&
    req.app.locals.knownPaths.includes(
      req.originalUrl ? req.originalUrl.split(/[?#]/)[0] : ""
    )
  ) {
    res.locals.currentUrl = req.originalUrl;
  }
  const session_id = hashSessionId(req.sessionID);
  const logger: Logger = req.app.locals.logger;
  logger.debug(`[${req.method}] ${req.originalUrl}`, requestMiddlewareLabel, {
    session_id,
    // user_agent: req.useragent,
  });
  next();
};

const logErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const session_id = hashSessionId(req.sessionID);
  const logger: Logger = req.app.locals.logger;
  const stack = err.stack ? `\n${err.stack}` : "";
  logger.error(
    `[${req.method}] ${req.originalUrl}. Error ${err.message}${stack}`,
    errorMiddlewareLabel,
    { session_id /*,user_agent: req.useragent*/ }
  );
  next(err);
};

export { logErrorMiddleware, logRequestMiddleware };
