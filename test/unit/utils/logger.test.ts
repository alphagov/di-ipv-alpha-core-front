import { SinonStub } from "sinon";

import Logger, { getLogLabel } from "../../../app/utils/logger";
import { expect, sinon } from "../../utils/testUtils";
import winstonLogger from "../../../app/utils/winston";

describe("Utils logger", () => {
  let sandbox: sinon.SinonSandbox;
  let consoleLogStub: SinonStub;
  let consoleDebugStub: SinonStub;
  let consoleErrorStub: SinonStub;
  const message = "Original";
  const label = "test.ts";

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("tracks a trace only on console", () => {
    consoleLogStub = sandbox.stub(winstonLogger, "log");
    const logger: Logger = new Logger();
    logger.info(message, label);

    expect(consoleLogStub).to.have.been.calledOnce;
  });

  it("tracks a request only on console", () => {
    consoleDebugStub = sandbox.stub(winstonLogger, "debug");
    const logger: Logger = new Logger();
    logger.debug(message, label);

    expect(consoleDebugStub).to.have.been.calledOnce;
  });

  it("tracks a exception only on console", () => {
    consoleErrorStub = sandbox.stub(winstonLogger, "error");
    const logger: Logger = new Logger();
    logger.error(message, label);

    expect(consoleErrorStub).to.have.been.calledOnce;
  });

  it("correctly gets path", () => {
    const path =
      "/fb-smart-freight-haulier-web-app/test/unit/utils/logger.test.ts";
    const pathReturned = getLogLabel(path);
    expect(pathReturned).to.eq("utils/logger.test.ts");
  });

  it("correctly gets path and discards backslashes", () => {
    const path =
      "something:\\fb-smart-freight-haulier-web-app/test/unit/utils/logger.test.ts";
    const pathReturned = getLogLabel(path);
    expect(pathReturned).to.eq("utils/logger.test.ts");
  });
});
