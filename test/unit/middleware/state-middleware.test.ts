import { NextFunction, Request, Response } from "express";

import { checkEditingModeMiddleware } from "../../../app/middleware/state-middleware";
import Logger from "../../../app/utils/logger";
import { createReq, createRes } from "../helpers";
import { expect, sinon } from "../../utils/testUtils";

describe("state-middleware @stateMiddleware", () => {
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

  it("should set editing flag to false", () => {
    checkEditingModeMiddleware(req as Request, res as Response, next);

    expect(req.session.state.editing).to.be.false;
    expect(next).to.have.been.calledOnce;
  });

  it("should set editing flag to true", () => {
    req.query = { edit: "" };
    checkEditingModeMiddleware(req as Request, res as Response, next);

    expect(req.session.state.editing).to.be.true;
    expect(next).to.have.been.calledOnce;
  });
});
