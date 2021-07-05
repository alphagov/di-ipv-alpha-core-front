import CookieBanner from "../../../client/cookie-banner";
import { expect, sinon } from "../../utils/testUtils";

describe("Cookie Banner", () => {
  let sandbox: sinon.SinonSandbox;
  let hideCookieBannerSpy: sinon.SinonSpy;
  let showCookieBannerSpy: sinon.SinonSpy;
  let cookieBanner: CookieBanner;
  const html = `<div id="cookie-banner">Cookie banner</div><div id="cookie-banner"></div>div id="cookie-banner"></div>`;

  before(() => {
    cookieBanner = new CookieBanner();
    document.body.innerHTML = html;
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    hideCookieBannerSpy = sandbox.spy(
      CookieBanner.prototype,
      "hideCookieBanner"
    );
    showCookieBannerSpy = sandbox.spy(
      CookieBanner.prototype,
      "showCookieBanner"
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should call init and show the cookie banner when cookie is missing", () => {
    cookieBanner.init();
    expect(hideCookieBannerSpy).to.not.have.been.calledOnce;
    expect(showCookieBannerSpy).to.have.been.calledOnce;
  });

  it("should call init and show the cookie banner when cookie is missing (second time)", () => {
    cookieBanner.init();
    expect(hideCookieBannerSpy).to.not.have.been.calledOnce;
    expect(showCookieBannerSpy).to.have.been.calledOnce;
  });

  it("should call init and hide the cookie banner when cookie is present", () => {
    cookieBanner.init();
    cookieBanner.addCookie();
    expect(hideCookieBannerSpy).to.have.been.calledOnce;
  });

  it("should hide cookie banner", () => {
    cookieBanner.hideCookieBanner();
    expect(cookieBanner.cookieBanner.style.display).to.equal("none");
  });

  it("should show cookie banner", () => {
    cookieBanner.showCookieBanner();
    expect(cookieBanner.cookieBanner.style.display).to.equal("block");
  });

  it("does nothing if cookie banner is not present", () => {
    document.body.innerHTML = "";
    cookieBanner.init();
    expect(hideCookieBannerSpy).to.not.have.been.calledOnce;
    expect(showCookieBannerSpy).to.not.have.been.calledOnce;
  });
});
