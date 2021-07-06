import { NextFunction, Request, Response } from "express";

import { createReq, createRes } from "../../../../../test/unit/helpers";
import { SetupCookiesController, getCookies } from "..";
import Logger from "../../../../utils/logger";
import { pathName } from "../../../../paths";
import { expect, sinon } from "../../../../../test/utils/testUtils";
const express = require("express");

describe("Cookies Controller", function () {
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

  describe("getCookies", () => {
    it("get Cookies should render cookies/view.njk", function () {
      req.headers = { cookie: "" };
      getCookies(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        "common/cookies/view.njk"
      );
    });

    it("should catch exception and call next with the error", function () {
      const error = new Error("an error");
      res.render = sandbox.stub().throws(error);
      req.headers = { cookie: "" };
      getCookies(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe("setupCookiesController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );
      new SetupCookiesController().initialise();
      expect(routerGetStub).to.have.been.calledWith(pathName.public.COOKIES);
    });
  });
});
