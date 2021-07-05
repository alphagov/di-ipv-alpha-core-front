import { SetupReturnController, getReturn } from "..";
import { pathName } from "../../../../paths";
import { expect, sinon } from "../../../../../test/utils/testUtils";

const express = require("express");

describe("Return Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("setupReturnController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupReturnController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.RETURN,
        getReturn
      );
    });
  });
});
