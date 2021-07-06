import { NextFunction, Request, Response } from "express";

import {
  validationErrorFormatter,
  bodyValidate as validate,
} from "../../../app/middleware/form-validation-middleware";
import Logger from "../../../app/utils/logger";
import { expect, sinon } from "../../utils/testUtils";
import { createReq, createRes } from "../helpers";

describe("Validation middleware @validation", () => {
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

  describe("validationErrorFormatter", () => {
    it("should format error message", () => {
      const error = {
        location: "body",
        msg: "a error message",
        param: "param",
        value: undefined,
        nestedErrors: undefined,
      };
      const formattedError = validationErrorFormatter(error);
      expect(formattedError).to.be.eql({
        text: error.msg,
        href: `#${error.param}`,
      });
    });
  });

  describe("validate", () => {
    it("should validate", () => {
      validate("template.njk")(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });
  });
});
