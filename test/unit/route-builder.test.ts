import { PageSetup } from "../../app/interfaces/PageSetup";
import { expect } from "chai";
import "../../app/features";

describe("Route builder check", () => {
  it("should return list of routes", () => {
    const privatePages = PageSetup.GetImplementations();
    expect(privatePages.length).to.equal(17);
  });
});
