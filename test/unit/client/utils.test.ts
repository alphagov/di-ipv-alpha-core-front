const govUK = require("govuk-frontend");
import CookieBanner from "../../../client/cookie-banner";
import { expect, sinon } from "../../utils/testUtils";
import { initialize, ready } from "../../../client/utils";

describe("Client Utils", () => {
  let sandbox: sinon.SinonSandbox;
  let callbackStub: sinon.SinonStub;
  let cookieBannerStub: sinon.SinonStub;
  let initAllStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    callbackStub = sandbox.stub();
    cookieBannerStub = sandbox.stub(CookieBanner.prototype, "init");
    initAllStub = sandbox.stub(govUK, "initAll");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("ready", () => {
    it("should call the callback", () => {
      ready(callbackStub);
      expect(callbackStub).to.have.been.calledOnce;
    });
  });

  describe("initialize", () => {
    it("should initialize client libraries", () => {
      initialize();
      expect(initAllStub).to.have.been.calledOnce;
      expect(cookieBannerStub).to.have.been.calledOnce;
    });
  });
});
