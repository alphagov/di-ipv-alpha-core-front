import { expect, sinon } from "../../utils/testUtils";
import { refreshToken, verifyToken } from "../../../app/utils/auth-utils";
import oidc, { Issuer } from "openid-client";
import jwt from "jsonwebtoken";

describe("Auth utils @verifyToken", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("verifyToken @verifyToken", () => {
    const jwk = {
      alg: "RS256",
      use: "sig",
      kid: "aKid",
      e: "AQAB",
      n: "aNexample",
      kty: "RSA",
    };

    it("should fail token verification and return an error", async () => {
      const issuer = new Issuer({ issuer: "testIssuer" });
      const keystoreGetStub = sandbox.stub().returns(jwk);
      sandbox.stub(issuer, "keystore").resolves({
        get: keystoreGetStub,
      } as any);
      const jwtDecodeStub = sandbox.stub(jwt, "decode").returns({
        header: {
          kid: "aKid",
        },
      });
      const jwtVerifyStub = sandbox.stub(jwt, "verify").yields("an error");
      const result = await verifyToken(issuer, "atoken");

      expect(jwtDecodeStub).to.have.been.calledWith("atoken", {
        complete: true,
      });
      expect(keystoreGetStub).to.have.been.calledOnce;
      expect(jwtVerifyStub).to.have.been.calledOnce;
      expect(result).to.haveOwnProperty("err");
    });

    it("should validate token and return decoded token", async () => {
      const issuer = new Issuer({ issuer: "testIssuer" });
      const keystoreGetStub = sandbox.stub().returns(jwk);
      sandbox.stub(issuer, "keystore").resolves({
        get: keystoreGetStub,
      } as any);
      const jwtDecodeStub = sandbox.stub(jwt, "decode").returns({
        header: {
          kid: "aKid",
        },
      });
      const jwtVerifyStub = sandbox
        .stub(jwt, "verify")
        .yields(null, "decoded token");
      const result = await verifyToken(issuer, "atoken");

      expect(jwtDecodeStub).to.have.been.calledWith("atoken", {
        complete: true,
      });
      expect(keystoreGetStub).to.have.been.calledOnce;
      expect(jwtVerifyStub).to.have.been.calledOnce;
      expect(result).to.haveOwnProperty("decoded");
    });
  });

  describe("refreshToken", () => {
    it("should refreshToken", async () => {
      const refreshStub = sandbox.stub();
      const clientStub: Partial<oidc.Client> = {
        refresh: refreshStub,
      };
      await refreshToken(clientStub as oidc.Client, "aToken");

      expect(refreshStub).to.have.been.called;
    });
  });
});
