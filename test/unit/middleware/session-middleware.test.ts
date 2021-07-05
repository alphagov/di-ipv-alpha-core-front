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
import {
  logSession,
  sessionTimeOutDialogStartCheck,
} from "../../../app/middleware/session-middleware";
import Logger from "../../../app/utils/logger";
import { expect, sinon } from "../../utils/testUtils";
import { pathName } from "../../../app/paths";

describe("session-middleware", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {},
        },
      } as Partial<Express.Session>,
      cookies: {},
      idam: {
        userDetails: {},
      },
      app: {
        locals: {
          logger,
        },
      } as any,
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      clearCookie: sandbox.stub(),
      send: sandbox.stub(),
      next: sandbox.stub(),
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });
  describe("logSession", () => {
    afterEach(() => {
      sandbox.restore();
    });

    it("logs session and calls next", () => {
      const loggerRequestStub = sandbox.stub(logger, "debug");
      logSession(req as Request, res as Response, next);

      expect(loggerRequestStub).to.have.been.called;
      expect(next).to.be.called;
    });

    it("catches error and calls next with error", () => {
      const error = new Error("an error");
      sandbox.stub(logger, "debug").throws(error);
      logSession(req as Request, res as Response, next);

      expect(next).to.be.calledWith(error);
    });
  });

  describe("sessionTimeOutDialogStartCheck", () => {
    it("should add startSessionTimeout to false in req.app.locals", () => {
      req.originalUrl = pathName.public.ACCESSIBILITY_STATEMENT;
      sessionTimeOutDialogStartCheck(req as Request, res as Response, next);

      expect(req.app.locals.startSessionTimeout).to.eql(false);
    });

    it("should add startSessionTimeout to true in req.app.locals", () => {
      req.originalUrl = pathName.tracked.LOGGED_IN;
      sessionTimeOutDialogStartCheck(req as Request, res as Response, next);

      expect(req.app.locals.startSessionTimeout).to.eql(true);
    });
  });
});
