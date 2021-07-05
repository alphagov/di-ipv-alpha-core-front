import { initMutuallyExclusiveCheckboxes } from "../../../client/mutually-exclusive-checkboxes";
import { expect, sinon } from "../../utils/testUtils";

describe("Mutually exclusive checkboxes @mutuallyExclusive", () => {
  let sandbox: sinon.SinonSandbox;
  let options: NodeListOf<HTMLInputElement>;
  let otherCheckBox: HTMLInputElement;
  const html = `
        <input class="govuk-checkboxes__input" id="contents" name="contents" type="checkbox" data-group="options">
        <input class="govuk-checkboxes__input" id="contents-2" name="contents" type="checkbox" data-group="options">
        <input class="govuk-checkboxes__input" id="contents-3" name="contents" type="checkbox" data-group="options">
        <input class="govuk-checkboxes__input" id="contents-4" name="contents" type="checkbox" data-group="options">
        <input class="govuk-checkboxes__input" id="contents-5" name="contents" type="checkbox" data-group="other">
    `;

  before(() => {
    document.body.innerHTML = html;
    options = document.querySelectorAll(
      'input[data-group="options"][type="checkbox"]'
    );
    otherCheckBox = document.querySelector(
      'input[data-group="other"][type="checkbox"]'
    );
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should deselect all options if other option is selected", () => {
    const e = new Event("change");
    initMutuallyExclusiveCheckboxes();
    options[0].checked = true;
    options[1].checked = true;
    options[2].checked = true;
    options[3].checked = true;

    otherCheckBox.checked = true;
    otherCheckBox.dispatchEvent(e);

    options.forEach((option) => {
      expect(option.checked).to.be.false;
    });
  });

  it("should not deselect any options if other option is deselected", () => {
    const e = new Event("change");
    initMutuallyExclusiveCheckboxes();
    options[0].checked = true;
    options[1].checked = true;
    options[2].checked = true;
    options[3].checked = true;

    otherCheckBox.checked = false;
    otherCheckBox.dispatchEvent(e);

    options.forEach((option) => {
      expect(option.checked).to.be.true;
    });
  });

  it("should deselect other option if an option is selected", () => {
    const e = new Event("change");
    initMutuallyExclusiveCheckboxes();
    otherCheckBox.checked = true;
    options[0].checked = true;
    options[0].dispatchEvent(e);
    expect(otherCheckBox.checked).to.be.false;
  });

  it("should not deselect other option if an option is deselected", () => {
    const e = new Event("change");
    initMutuallyExclusiveCheckboxes();
    otherCheckBox.checked = true;
    options[0].checked = false;
    options[0].dispatchEvent(e);
    expect(otherCheckBox.checked).to.be.true;
  });
});
