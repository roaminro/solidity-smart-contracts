import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { commonFixtures } from "./fixtures/common";

describe("Deployment", function () {
  it("Should deploy and register systems and components", async function () {
    const { raceSystem, moveSystem } = await loadFixture(commonFixtures);

    expect(await raceSystem.paused()).to.equal(false);
    expect(await moveSystem.paused()).to.equal(false);
  });
});
