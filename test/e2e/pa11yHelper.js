const Pa11y = require("pa11y");
const htmlReporter = require("pa11y-reporter-html");
const fs = require("fs");

const { Helper } = require("codeceptjs");

class Pa11yHelper extends Helper {
  async runPa11yOn(url, usePuppeteerBrowserObject = true) {
    let puppeteer = null;
    if (usePuppeteerBrowserObject) {
      const browser = this.helpers["Puppeteer"].browser;
      const page = this.helpers["Puppeteer"].page;
      puppeteer = {
        ignoreUrl: true,
        browser: browser,
        page: page,
      };
    }

    const results = await Pa11y(url, {
      ...puppeteer,
      runners: ["axe"],
      standard: "WCAG2AA",
      threshold: 0,
      userAgent: "A11Y TESTS",
      hideElements: "#phase-banner, .govuk-back-link",
    });
    const html = await htmlReporter.results(results, url);
    if (!fs.existsSync("functional-output/accessibility-report")) {
      fs.mkdirSync(
        "functional-output/accessibility-report",
        {
          recursive: true,
          mode: 0o777,
        },
        (err) => {
          if (err) throw err;
        }
      );
    }
    fs.writeFile(
      "functional-output/accessibility-report/report.html",
      html,
      {
        flag: "a",
      },
      (err) => {
        if (err) throw err;
      }
    );
  }
}

module.exports = Pa11yHelper;
