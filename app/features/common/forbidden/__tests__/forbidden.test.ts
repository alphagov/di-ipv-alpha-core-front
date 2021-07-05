import { NextFunction, Request, Response } from "express";

import { SetupForbiddenController, getForbidden } from "../controller";
import { createReq, createRes } from "../../../../../test/unit/helpers";
import Logger from "../../../../utils/logger";
import { pathName } from "../../../../paths";
import { expect, sinon } from "../../../../../test/utils/testUtils";

const express = require("express");

describe("NotApplicable", function () {
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

  describe("getForbidden", () => {
    it("should render radioQuestionPage template with question", () => {
      getForbidden(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith("common/forbidden/view.njk");
    });

    it("should catch exception and call next with the error", function () {
      const error = new Error("an error");
      res.render = sandbox.stub().throws(error);
      getForbidden(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe("SetupForbiddenController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );
      new SetupForbiddenController().initialise();

      expect(routerGetStub).to.have.been.calledWith(pathName.public.FORBIDDEN);
    });
  });
});
