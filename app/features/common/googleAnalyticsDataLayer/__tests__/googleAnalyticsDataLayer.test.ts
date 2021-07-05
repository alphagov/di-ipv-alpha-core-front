import { NextFunction, Request, Response } from "express";
import { expect, sinon } from "../../../../../test/utils/testUtils";
import { createReq, createRes } from "../../../../../test/unit/helpers";
import Logger from "../../../../utils/logger";
import { getDataLayerScript } from "../controller";
import moment from "moment";
import * as dateFuncs from "../../../../utils/date-time-utils";

// stub out getUKDateTime frunction so it is consistent
sinon
  .stub(dateFuncs, "getUKDateTime")
  .returns(moment("2020-01-01T00:00:00.000Z"));

describe("Google Analytics Data Layer JS", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = createReq(logger, sandbox);
    res = createRes(sandbox);
    res.type = sandbox.stub() as (type: string) => Response<any>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getDataLayerScript", () => {
    it("return a JS type", () => {
      getDataLayerScript(req as Request, res as Response, next);

      expect(res.type).to.have.been.calledWith("js");
    });

    it("Transfers the language", () => {
      req.i18n.language = "fa";
      req.session.declaration = null;

      getDataLayerScript(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        "common/googleAnalyticsDataLayer/dataLayerScriptJs.njk",
        {
          dataLayerData: {
            timestamp: dateFuncs.getUKDateTime(moment()).toISOString(),
            language: "fa",
          },
        }
      );
    });

    it("Transfers an empty declaration", () => {
      req.session.declaration = {};

      getDataLayerScript(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith(
        "common/googleAnalyticsDataLayer/dataLayerScriptJs.njk",
        {
          dataLayerData: {
            timestamp: dateFuncs.getUKDateTime(moment()).toISOString(),
            language: "en",
          },
        }
      );
    });
  });
});
