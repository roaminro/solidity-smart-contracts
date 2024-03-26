import {
  time,
  loadFixture,
  impersonateAccount,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { MapSystem } from "../typechain-types";

const DEPLOYER_ADDRESS = "0xBBD7180eabD117dc223Dc772806efedf3a2116F1";
const GAME_REGISTRY_ADDRESS = "0x418cf1bab316644e515b67befb4e4e99c7eb5604";

const GAME_LOGIC_CONTRACT_ROLE = hre.ethers.solidityPackedKeccak256(
  ["string"],
  ["GAME_LOGIC_CONTRACT_ROLE"]
);

describe("Lock", function () {
  async function deployFixture() {
    const [acc1] = await hre.ethers.getSigners();

    // setup deployer signer
    await impersonateAccount(DEPLOYER_ADDRESS);
    const deployer = await hre.ethers.getSigner(DEPLOYER_ADDRESS);

    // setup game registry
    const gameRegistry = await hre.ethers.getContractAt(
      "IGameRegistry",
      GAME_REGISTRY_ADDRESS
    );
    const gameRegistryAccessControl = await hre.ethers.getContractAt(
      "IAccessControlUpgradeable",
      GAME_REGISTRY_ADDRESS
    );

    // deploy map system
    const MapSystem = await hre.ethers.getContractFactory(
      "MapSystem",
      deployer
    );

    const mapSystem = (await hre.upgrades.deployProxy(MapSystem, [
      GAME_REGISTRY_ADDRESS,
    ])) as unknown as MapSystem;

    await mapSystem.waitForDeployment();

    const trackSystemAddress = await mapSystem.getAddress();
    const trackSystemId = await mapSystem.getId();
    console.log("trackSystemAddress", trackSystemAddress);
    console.log("trackSystemId", trackSystemId.toString(16));

    // register TrackSystem with GameRegistry
    let t = await gameRegistry
      .connect(deployer)
      .registerSystem(trackSystemId, trackSystemAddress);
    await t.wait();

    // set GAME_LOGIC_CONTRACT_ROLE for TrackSystem contract
    t = await gameRegistryAccessControl
      .connect(deployer)
      .grantRole(GAME_LOGIC_CONTRACT_ROLE, trackSystemAddress);
    await t.wait();

    // deploy position2d component
    const Position2dComponent = await hre.ethers.getContractFactory(
      "Position2DComponent",
      deployer
    );
    // const position2dComponent = await hre.upgrades.deployProxy(Position2dComponent, [GAME_REGISTRY_ADDRESS]);
    const position2dComponent = await Position2dComponent.deploy(
      GAME_REGISTRY_ADDRESS
    );
    await position2dComponent.waitForDeployment();
    const position2dComponentAddress = await position2dComponent.getAddress();
    const position2dComponentId = await position2dComponent.getId();

    console.log("position2dComponentAddress", position2dComponentAddress);
    console.log("position2dComponentId", position2dComponentId.toString(16));

    // register Position2DComponent with GameRegistry
    t = await gameRegistry
      .connect(deployer)
      .registerComponent(position2dComponentId, position2dComponentAddress);
    await t.wait();

    return { mapSystem, gameRegistry, deployer, acc1 };
  }

  describe("Deployment", function () {
    it("Should deploy and register system and component", async function () {
      const { mapSystem } = await loadFixture(deployFixture);

      expect(await mapSystem.paused()).to.equal(true);
    });
  });

  describe("Position", function () {
    it("Should set/get a position", async function () {
      const { mapSystem, acc1 } = await loadFixture(deployFixture);

      await mapSystem.connect(acc1).setPosition(2, 3);

      const position = await mapSystem.getPosition(acc1);
      expect(position.x).to.eq(2n);
      expect(position.y).to.eq(3n);
    });
  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
