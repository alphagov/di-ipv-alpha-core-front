let titles = [];
const testUrl = "http://localhost:3010";
import { pathName } from "../../../../app/paths";

module.exports = {
  common(I) {
    After(() => {
      titles = [];
    });

    Given("I am on the home page", async () => {
      await I.amOnPage(`${testUrl}${pathName.public.JSON}`);
      await I.runPa11yOn(`${testUrl}${pathName.public.JSON}`);
    });

    Then(/^I see "([^"]*)" in title$/, async (title: string) => {
      await I.see(title, "h1");
      const url = await I.grabCurrentUrl();
      await I.runPa11yOn(url);
    });

    Then(/^I see "([^"]*)" in "([^"]*)"$/, async (title: string, element) => {
      await I.see(title, element);
    });

    Then(/^I see "([^"]*)" in the current url$/, async (key: string) => {
      await I.seeInCurrentUrl(key);
    });

    Then(
      /^I go back through the pages and they are in the correct order$/,
      async () => {
        // remove current page before reversing
        titles.pop();
        const reverseTitles = titles.reverse();
        await reverseTitles.forEach((title) => {
          I.click(".govuk-back-link");
          I.see(title, "h1");
        });
      }
    );

    Then(/^I see "([^"]*)" item in list$/, async (title: string) => {
      await I.see(title, "ul");
    });

    Then(/^I see "([^"]*)" link$/, async (title: string) => {
      await I.see(title, "a");
    });

    Then(/^I see element with id "([^"]*)"$/, async (id: string) => {
      await I.seeElement(`#${id}`);
    });

    Then(/^I see "([^"]*)" error$/, async (text: string) => {
      await I.see(text, "ul.govuk-error-summary__list > li > a");
      await I.see(text, "span.govuk-error-message");
      const url = await I.grabCurrentUrl();
      await I.runPa11yOn(url);
    });

    Then(/^I fill textarea with "([^"]*)"$/, async (title: string) => {
      await I.fillField("textarea", title);
    });

    Then(/^I fill "([^"]*)" field with "([^"]*)"$/, async (field, value) => {
      await I.fillField(field, value);
    });

    Then(/^I fill trip date with tomorrow's date$/, async () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      await I.fillField("Day", date.getDate());
      await I.fillField("Month", date.getMonth() + 1);
      await I.fillField("Year", date.getFullYear());
    });

    Then(/^I check "([^"]*)" option$/, async (option) => {
      await I.checkOption(option);
    });

    Then(
      /^I select "([^"]*)" option in "([^"]*)" drop-down select$/,
      async (option, select) => {
        await I.selectOption(select, option);
      }
    );

    Then(/^I click continue$/, async () => {
      await I.click("Continue");
    });

    When(/^I click "([^"]*)" button$/, async (selector: string) => {
      await I.click(selector);
    });

    When(/^I click "([^"]*)" link$/, async (selector: string) => {
      await I.click(selector);
    });

    Then(/^I wait "([^"]*)"$/, (time) => {
      I.wait(time);
    });

    Then(/^I click "([^"]*)" change link$/, async (text) => {
      await I.click(
        "Change",
        `//div/dt[contains(text(), "${text}")]/parent::div//a`
      );
    });

    Then(/^I see "([^"]*)" dropdown$/, async (text) => {
      await I.see(text, "span.govuk-details__summary-text");
    });
  },
};
