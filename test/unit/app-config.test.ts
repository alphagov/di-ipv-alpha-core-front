import { Application } from "express";
import i18next from "i18next";
import nunjucks from "nunjucks";
import path from "path";
import {
  configureInternalization,
  configureLogger,
  configureNunjucks,
} from "../../app/app-config";
import Logger from "../../app/utils/logger";
import { expect, sinon } from "../utils/testUtils";
import Sinon from "sinon";

const setupMockRedis = () => {
  process.env.CLIENT_SECRET = "test";
  process.env.SESSION_SECRET = "test";
  process.env.REDIS_SESSION_URL = "127.0.0.1";
  process.env.REDIS_PORT = "6379";
  process.env.NODE_ENV = "test";
};

describe("app-config @config", () => {
  let appMock: Partial<Application>;
  let configArgs = null;
  sinon.stub();
  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    setupMockRedis();
    appMock = {
      locals: {
        logger: null,
      },
      set: (): Application => null,
      use: (): any => null,
    };

    configArgs = [
      ["app/features", path.resolve("node_modules/govuk-frontend/")],
      {
        autoescape: true,
        express: appMock,
        noCache: true,
      },
    ];
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    delete process.env.CLIENT_SECRET;
    delete process.env.SESSION_SECRET;
    sandbox.restore();
  });

  describe("configureLogger", () => {
    it("configures a logger and adds it to express app", () => {
      configureLogger(appMock as Application);
      expect(appMock.locals.logger).to.have.instanceof(Logger);
    });
  });

  describe("configureNunjucks", () => {
    it("configures nunjucks environment", () => {
      const nunjucksEnv = sinon.createStubInstance(nunjucks.Environment);
      const nunjucksMock = sinon.mock(nunjucks);
      nunjucksMock
        .expects("configure")
        .withExactArgs(...configArgs)
        .once()
        .returns(nunjucksEnv);

      configureNunjucks(appMock as Application);

      nunjucksMock.verify();
      expect(nunjucksEnv.addFilter).callCount(8);
      expect(nunjucksEnv.addFilter).to.have.been.calledWith("eval");
      expect(nunjucksEnv.addFilter).to.have.been.calledWith("translate");
      expect(nunjucksEnv.addFilter).to.have.been.calledWith("toUnicode");
      expect(nunjucksEnv.addFilter).to.have.been.calledWith("toJSON");
      expect(nunjucksEnv.addFilter).to.have.been.calledWith("lastErrors");
      expect(nunjucksEnv.addFilter).to.have.been.calledWith(
        "encodeURIComponent"
      );
      expect(nunjucksEnv.addFilter).to.have.been.calledWith(
        "decodeURIComponent"
      );
      expect(nunjucksEnv.addFilter).to.have.been.calledWith("updateUrlQuery");
      nunjucksMock.restore();
    });
  });

  describe("configureInternalization", () => {
    it("configures i18next for translations", async () => {
      appMock.locals.logger = sinon.createStubInstance(Logger);
      const i18nextMock = sinon.mock(i18next);
      const i18nInitStub = sinon.stub(i18next, "init").resolves();
      await configureInternalization(appMock as Application);

      expect(i18nInitStub).to.have.been.called;
      i18nextMock.verify();
      expect(appMock.locals.logger.info).calledOnce;
      i18nextMock.restore();
    });
  });
});
