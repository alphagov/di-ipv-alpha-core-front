import { NextFunction, Request, Response } from "express";

import { setupCsrfToken } from "../../../app/middleware/csrf-middleware";
import Logger from "../../../app/utils/logger";
import { createReq, createRes } from "../helpers";
import { expect, sinon } from "../../utils/testUtils";

describe("auth-middleware", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = createReq(logger, sandbox);
    res = createRes(sandbox);
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should add csrf token to req.locals", () => {
    const csrfTokenStub = sandbox.stub();
    req.csrfToken = csrfTokenStub;
    setupCsrfToken(req as Request, res as Response, next);

    expect(csrfTokenStub).to.have.been.called;
    expect(next).to.have.been.called;
  });
});
