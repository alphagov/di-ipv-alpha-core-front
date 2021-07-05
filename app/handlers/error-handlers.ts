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
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "http-status-codes";
import { pathName } from "../paths";
import hashSessionId from "../utils/hashSessionId";

import Logger, { getLogLabel } from "../utils/logger";

const logLabel: string = getLogLabel(__filename);

const pageNotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next();
  }
  res.status(NOT_FOUND);
  res.redirect(pathName.public.ERROR404);
};

const serverErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger: Logger = req.app.locals.logger;
  const session_id = hashSessionId(req.sessionID);
  if (err.code === "EBADCSRFTOKEN") {
    if (logger) {
      logger.debug("Timeout due to inactive session.", logLabel, {
        session_id,
        user_agent: req.useragent,
      });
    }
    res.status(OK);
    return res.redirect(pathName.public.TIMEOUT);
  }

  if (logger) {
    logger.error(err, logLabel, { session_id, user_agent: req.useragent });
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(INTERNAL_SERVER_ERROR);
  res.redirect(pathName.public.ERROR500);
};

export { pageNotFoundHandler, serverErrorHandler };
