const { setHeadlessWhen } = require("@codeceptjs/configure");

const headless = !process.env.HEADLESS || process.env.HEADLESS === "true";
setHeadlessWhen(headless);

process.env.CODECEPT_RUNNING = "true";

exports.config = {
  name: "nunjucks-base-web-app",
  output: "./functional-output/e2e/reports/",
  helpers: {
    Pa11yHelper: {
      require: "./test/e2e/pa11yHelper.js",
    },
    Puppeteer: {
      url: "http://localhost:3010",
      show: false,
      chrome: {
        ignoreHTTPSErrors: true,
      },
    },
  },
  bootstrap: "./test/e2e/bootstrap.ts",
  bootstrapAll: "./test/e2e/bootstrap.ts",
  teardown: "./test/e2e/bootstrap.ts",
  teardownAll: "./test/e2e/bootstrap.ts",
  mocha: {},
  gherkin: {
    features: "./test/e2e/**/*.feature",
    steps: ["./test/e2e/step_definitions/steps.ts"],
  },
  plugins: {
    stepByStepReport: {
      enabled: false,
      fullPageScreenshots: true,
      deleteSuccessful: true,
    },
  },
  require: ["ts-node/register/transpile-only"],
};
