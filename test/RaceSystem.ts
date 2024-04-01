import {
  loadFixture,
  impersonateAccount,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { EventLog } from "ethers";
import { MoveSystem, RaceSystem } from "../typechain-types";

const DEPLOYER_ADDRESS = "0xBBD7180eabD117dc223Dc772806efedf3a2116F1";
const GAME_REGISTRY_ADDRESS = "0x418cf1bab316644e515b67befb4e4e99c7eb5604";

const GAME_LOGIC_CONTRACT_ROLE = hre.ethers.solidityPackedKeccak256(
  ["string"],
  ["GAME_LOGIC_CONTRACT_ROLE"]
);

function Enum(...options: any[]) {
  return Object.fromEntries(options.map((key, i) => [key, BigInt(i)]));
}

enum RaceStatus {
  UNDEFINED,
  WAITING_FOR_PLAYERS,
  STARTED,
  FINISHED,
}

describe("Race", function () {
  async function deployFixture() {
    const [acc1, acc2, acc3] = await hre.ethers.getSigners();

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

    // deploy and register race system
    const RaceSystem = await hre.ethers.getContractFactory(
      "RaceSystem",
      deployer
    );

    const raceSystem = (await hre.upgrades.deployProxy(RaceSystem, [
      GAME_REGISTRY_ADDRESS,
    ])) as unknown as RaceSystem;

    await raceSystem.waitForDeployment();

    const raceSystemAddress = await raceSystem.getAddress();
    const raceSystemId = await raceSystem.getId();

    let tx = await gameRegistry
      .connect(deployer)
      .registerSystem(raceSystemId, raceSystemAddress);
    await tx.wait();

    // set GAME_LOGIC_CONTRACT_ROLE for RaceSystem contract
    tx = await gameRegistryAccessControl
      .connect(deployer)
      .grantRole(GAME_LOGIC_CONTRACT_ROLE, raceSystemAddress);
    await tx.wait();

    console.log("RaceSystem deployed and registered");
    console.log("raceSystemAddress", raceSystemAddress);
    console.log("raceSystemId", raceSystemId.toString(16));
    console.log("------------------------------------------");

    // deploy and register move system
    const MoveSystem = await hre.ethers.getContractFactory(
      "MoveSystem",
      deployer
    );

    const moveSystem = (await hre.upgrades.deployProxy(MoveSystem, [
      GAME_REGISTRY_ADDRESS,
    ])) as unknown as MoveSystem;

    await moveSystem.waitForDeployment();

    const moveSystemAddress = await moveSystem.getAddress();
    const moveSystemId = await moveSystem.getId();

    tx = await gameRegistry
      .connect(deployer)
      .registerSystem(moveSystemId, moveSystemAddress);
    await tx.wait();

    // set GAME_LOGIC_CONTRACT_ROLE for MoveSystem contract
    tx = await gameRegistryAccessControl
      .connect(deployer)
      .grantRole(GAME_LOGIC_CONTRACT_ROLE, moveSystemAddress);
    await tx.wait();

    console.log("MoveSystem deployed and registered");
    console.log("moveSystemAddress", moveSystemAddress);
    console.log("moveSystemId", moveSystemId.toString(16));
    console.log("------------------------------------------");

    // deploy and register RaceComponent component
    const RaceComponent = await hre.ethers.getContractFactory(
      "RaceComponent",
      deployer
    );

    const raceComponent = await RaceComponent.deploy(GAME_REGISTRY_ADDRESS);
    await raceComponent.waitForDeployment();
    const raceComponentAddress = await raceComponent.getAddress();
    const raceComponentId = await raceComponent.getId();

    // register RaceComponent with GameRegistry
    tx = await gameRegistry
      .connect(deployer)
      .registerComponent(raceComponentId, raceComponentAddress);
    await tx.wait();

    console.log("RaceComponent deployed and registered");
    console.log("raceComponentAddress", raceComponentAddress);
    console.log("raceComponentId", raceComponentId.toString(16));
    console.log("------------------------------------------");

    // deploy and register Speed2DComponent component
    const Speed2DComponent = await hre.ethers.getContractFactory(
      "Speed2DComponent",
      deployer
    );

    const speed2DComponent = await Speed2DComponent.deploy(
      GAME_REGISTRY_ADDRESS
    );
    await speed2DComponent.waitForDeployment();
    const speed2DComponentAddress = await speed2DComponent.getAddress();
    const speed2DComponentId = await speed2DComponent.getId();

    // register Speed2DComponent with GameRegistry
    tx = await gameRegistry
      .connect(deployer)
      .registerComponent(speed2DComponentId, speed2DComponentAddress);
    await tx.wait();

    console.log("Speed2DComponent deployed and registered");
    console.log("speed2DComponentAddress", speed2DComponentAddress);
    console.log("speed2DComponentId", speed2DComponentId.toString(16));
    console.log("------------------------------------------");

    // deploy and register Position2DComponent component
    const Position2dComponent = await hre.ethers.getContractFactory(
      "Position2DComponent",
      deployer
    );

    const position2dComponent = await Position2dComponent.deploy(
      GAME_REGISTRY_ADDRESS
    );
    await position2dComponent.waitForDeployment();
    const position2dComponentAddress = await position2dComponent.getAddress();
    const position2dComponentId = await position2dComponent.getId();

    // register Position2DComponent with GameRegistry
    tx = await gameRegistry
      .connect(deployer)
      .registerComponent(position2dComponentId, position2dComponentAddress);
    await tx.wait();

    console.log("Position2DComponent deployed and registered");
    console.log("position2dComponentAddress", position2dComponentAddress);
    console.log("position2dComponentId", position2dComponentId.toString(16));
    console.log("------------------------------------------");

    // unpause systems
    tx = await raceSystem.connect(deployer).setPaused(false);
    await tx.wait();
    tx = await moveSystem.connect(deployer).setPaused(false);
    await tx.wait();

    return { raceSystem, moveSystem, gameRegistry, deployer, acc1, acc2, acc3 };
  }

  describe("Deployment", function () {
    it("Should deploy and register systems and components", async function () {
      const { raceSystem, moveSystem } = await loadFixture(deployFixture);

      expect(await raceSystem.paused()).to.equal(false);
      expect(await moveSystem.paused()).to.equal(false);
    });
  });

  describe("Race", function () {
    it("Should create a race", async function () {
      const { raceSystem, acc1 } = await loadFixture(deployFixture);

      let tx = await raceSystem.connect(acc1).createRace({
        nbPlayers: 3,
      });

      let receipt = await tx.wait();

      await expect(tx)
        .to.emit(raceSystem, "RaceCreated")
        .withArgs(anyValue, acc1);

      let event = receipt?.logs.find(
        (log) => log instanceof EventLog && log.eventName === "RaceCreated"
      ) as EventLog;

      let [raceID] = event.args;

      let race = await raceSystem.getRace(raceID);
      expect(race.creator).to.eq(acc1);
      expect(race.status).to.eq(RaceStatus.WAITING_FOR_PLAYERS);
      expect(race.nbPlayersJoined).to.eq(0);
      expect(race.players).to.deep.eq([
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
      ]);
    });

    it("Should join and start a race", async function () {
      const { raceSystem, acc1, acc2 } = await loadFixture(deployFixture);

      let tx = await raceSystem.connect(acc1).createRace({
        nbPlayers: 2,
      });

      let receipt = await tx.wait();

      let event = receipt?.logs.find(
        (log) => log instanceof EventLog && log.eventName === "RaceCreated"
      ) as EventLog;

      let [raceID] = event.args;

      tx = await raceSystem.connect(acc1).joinRace({
        raceID,
      });

      receipt = await tx.wait();

      expect(tx).to.emit(raceSystem, "PlayerJoined").withArgs(raceID, acc1);

      let race = await raceSystem.getRace(raceID);
      expect(race.creator).to.eq(acc1);
      expect(race.status).to.eq(RaceStatus.WAITING_FOR_PLAYERS);
      expect(race.nbPlayersJoined).to.eq(1);
      expect(race.players).to.deep.eq([
        acc1.address,
        "0x0000000000000000000000000000000000000000",
      ]);

      tx = await raceSystem.connect(acc2).joinRace({
        raceID,
      });

      receipt = await tx.wait();

      expect(tx).to.emit(raceSystem, "PlayerJoined").withArgs(raceID, acc2);
      expect(tx).to.emit(raceSystem, "RaceStarted").withArgs(raceID);

      race = await raceSystem.getRace(raceID);
      expect(race.creator).to.eq(acc1);
      expect(race.status).to.eq(RaceStatus.STARTED);
      expect(race.nbPlayersJoined).to.eq(2);
      expect(race.players).to.deep.eq([acc1.address, acc2.address]);
    });

    it("Should not join a race", async function () {
      const { raceSystem, acc1, acc2, acc3 } = await loadFixture(deployFixture);

      let tx = await raceSystem.connect(acc1).createRace({
        nbPlayers: 2,
      });

      let receipt = await tx.wait();

      let event = receipt?.logs.find(
        (log) => log instanceof EventLog && log.eventName === "RaceCreated"
      ) as EventLog;

      let [raceID] = event.args;

      await expect(
        raceSystem.connect(acc1).joinRace({
          raceID: 1,
        })
      ).to.revertedWithCustomError(raceSystem, "RaceNotFound");

      tx = await raceSystem.connect(acc1).joinRace({
        raceID,
      });

      receipt = await tx.wait();

      await expect(
        raceSystem.connect(acc1).joinRace({
          raceID,
        })
      ).to.revertedWithCustomError(raceSystem, "PlayerAlreadyJoined");

      tx = await raceSystem.connect(acc2).joinRace({
        raceID,
      });

      receipt = await tx.wait();

      await expect(
        raceSystem.connect(acc3).joinRace({
          raceID,
        })
      ).to.revertedWithCustomError(raceSystem, "RaceAlreadyStarted");
    });
  });
});
