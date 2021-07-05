import { HealthCheckState, onHealthCheck } from "../../app/health-check";
import { expect, sinon } from "../utils/testUtils";

describe("Health check", async () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("health check state enums resolve to valid string values", async () => {
    await expect(HealthCheckState.UP).eql("UP");
    await expect(HealthCheckState.DOWN).eql("DOWN");
  });

  it("should return industry health check is up", async () => {
    const status = await onHealthCheck();
    await expect(status).eql(undefined);
  });

  it("should toggle health check state value", async () => {
    let status = await onHealthCheck();
    await expect(
      status,
      "initial value is undefined as no errors to return"
    ).eql(undefined);

    try {
      await onHealthCheck();
    } catch (e) {
      expect(e.message).eql("health check failed");
    }

    status = await onHealthCheck();
    await expect(status, "onHealthCheck should return undefined").eql(
      undefined
    );
  });
});
