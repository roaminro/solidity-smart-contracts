import hre from "hardhat";
import {
  GameRegistry,
  MoveSystem,
  RaceSystem,
  TrackSystem,
} from "../typechain-types";
import {
  DEPLOYER_ROLE,
  PAUSER_ROLE,
  GAME_LOGIC_CONTRACT_ROLE,
  MANAGER_ROLE,
} from "./utils";

export async function deployFixture() {
  const [deployer, manager, acc1, acc2, acc3] = await hre.ethers.getSigners();

  // setup game registry
  const GameRegistry = await hre.ethers.getContractFactory(
    "GameRegistry",
    deployer
  );

  const gameRegistry = (await hre.upgrades.deployProxy(GameRegistry, [
    deployer.address,
  ])) as unknown as GameRegistry;

  const gameRegistryAddress = await gameRegistry.getAddress();

  // set DEPLOYER_ROLE for deployer address
  let tx = await gameRegistry
    .connect(deployer)
    .grantRole(DEPLOYER_ROLE, deployer.address);
  await tx.wait();

  // set PAUSER_ROLE for deployer address
  tx = await gameRegistry
    .connect(deployer)
    .grantRole(PAUSER_ROLE, deployer.address);
  await tx.wait();

  // deploy and register race system
  const RaceSystem = await hre.ethers.getContractFactory(
    "RaceSystem",
    deployer
  );

  const raceSystem = (await hre.upgrades.deployProxy(RaceSystem, [
    gameRegistryAddress,
  ])) as unknown as RaceSystem;

  await raceSystem.waitForDeployment();

  const raceSystemAddress = await raceSystem.getAddress();
  const raceSystemId = await raceSystem.getId();

  tx = await gameRegistry
    .connect(deployer)
    .registerSystem(raceSystemId, raceSystemAddress);
  await tx.wait();

  // set GAME_LOGIC_CONTRACT_ROLE for RaceSystem contract
  tx = await gameRegistry
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
    gameRegistryAddress,
  ])) as unknown as MoveSystem;

  await moveSystem.waitForDeployment();

  const moveSystemAddress = await moveSystem.getAddress();
  const moveSystemId = await moveSystem.getId();

  tx = await gameRegistry
    .connect(deployer)
    .registerSystem(moveSystemId, moveSystemAddress);
  await tx.wait();

  // set GAME_LOGIC_CONTRACT_ROLE for MoveSystem contract
  tx = await gameRegistry
    .connect(deployer)
    .grantRole(GAME_LOGIC_CONTRACT_ROLE, moveSystemAddress);
  await tx.wait();

  console.log("MoveSystem deployed and registered");
  console.log("moveSystemAddress", moveSystemAddress);
  console.log("moveSystemId", moveSystemId.toString(16));
  console.log("------------------------------------------");

  // deploy and register track system
  const TrackSystem = await hre.ethers.getContractFactory(
    "TrackSystem",
    deployer
  );

  const trackSystem = (await hre.upgrades.deployProxy(TrackSystem, [
    gameRegistryAddress,
  ])) as unknown as TrackSystem;

  await trackSystem.waitForDeployment();

  const trackSystemAddress = await trackSystem.getAddress();
  const trackSystemId = await trackSystem.getId();

  tx = await gameRegistry
    .connect(deployer)
    .registerSystem(trackSystemId, trackSystemAddress);
  await tx.wait();

  // set GAME_LOGIC_CONTRACT_ROLE for TrackSystem contract
  tx = await gameRegistry
    .connect(deployer)
    .grantRole(GAME_LOGIC_CONTRACT_ROLE, trackSystemAddress);
  await tx.wait();

  console.log("TrackSystem deployed and registered");
  console.log("trackSystemAddress", trackSystemAddress);
  console.log("trackSystemId", trackSystemId.toString(16));
  console.log("------------------------------------------");

  // deploy and register RaceComponent component
  const RaceComponent = await hre.ethers.getContractFactory(
    "RaceComponent",
    deployer
  );

  const raceComponent = await RaceComponent.deploy(gameRegistryAddress);
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

  const speed2DComponent = await Speed2DComponent.deploy(gameRegistryAddress);
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

  // deploy and register Speed2DComponent component
  const EnergyComponent = await hre.ethers.getContractFactory(
    "EnergyComponent",
    deployer
  );

  const energyComponent = await EnergyComponent.deploy(gameRegistryAddress);
  await energyComponent.waitForDeployment();
  const energyComponentAddress = await energyComponent.getAddress();
  const energyComponentId = await energyComponent.getId();

  // register EnergyComponent with GameRegistry
  tx = await gameRegistry
    .connect(deployer)
    .registerComponent(energyComponentId, energyComponentAddress);
  await tx.wait();

  console.log("EnergyComponent deployed and registered");
  console.log("energyComponentAddress", energyComponentAddress);
  console.log("energyComponentId", energyComponentId.toString(16));
  console.log("------------------------------------------");

  // deploy and register Position2DComponent component
  const Position2dComponent = await hre.ethers.getContractFactory(
    "Position2DComponent",
    deployer
  );

  const position2dComponent = await Position2dComponent.deploy(
    gameRegistryAddress
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

  // deploy and register LineSegment2DComponent component
  const LineSegment2DComponent = await hre.ethers.getContractFactory(
    "LineSegment2DComponent",
    deployer
  );

  const lineSegment2DComponent = await LineSegment2DComponent.deploy(
    gameRegistryAddress
  );
  await lineSegment2DComponent.waitForDeployment();
  const lineSegment2DComponentAddress =
    await lineSegment2DComponent.getAddress();
  const lineSegment2DComponentId = await lineSegment2DComponent.getId();

  // register LineSegment2DComponent with GameRegistry
  tx = await gameRegistry
    .connect(deployer)
    .registerComponent(lineSegment2DComponentId, lineSegment2DComponentAddress);
  await tx.wait();

  console.log("LineSegment2DComponent deployed and registered");
  console.log("lineSegment2DComponentAddress", lineSegment2DComponentAddress);
  console.log(
    "lineSegment2DComponentId",
    lineSegment2DComponentId.toString(16)
  );
  console.log("------------------------------------------");

  // deploy and register CheckpointComponent component
  const CheckpointComponent = await hre.ethers.getContractFactory(
    "CheckpointComponent",
    deployer
  );

  const checkpointComponent = await CheckpointComponent.deploy(
    gameRegistryAddress
  );
  await checkpointComponent.waitForDeployment();
  const checkpointComponentAddress = await checkpointComponent.getAddress();
  const checkpointComponentId = await checkpointComponent.getId();

  // register CheckpointComponent with GameRegistry
  tx = await gameRegistry
    .connect(deployer)
    .registerComponent(checkpointComponentId, checkpointComponentAddress);
  await tx.wait();

  console.log("CheckpointComponent deployed and registered");
  console.log("checkpointComponentAddress", checkpointComponentAddress);
  console.log("checkpointComponentId", checkpointComponentId.toString(16));
  console.log("------------------------------------------");

  // deploy and register TrackComponent component
  const TrackComponent = await hre.ethers.getContractFactory(
    "TrackComponent",
    deployer
  );

  const trackComponent = await TrackComponent.deploy(gameRegistryAddress);
  await trackComponent.waitForDeployment();
  const trackComponentAddress = await trackComponent.getAddress();
  const trackComponentId = await trackComponent.getId();

  // register TrackComponent with GameRegistry
  tx = await gameRegistry
    .connect(deployer)
    .registerComponent(trackComponentId, trackComponentAddress);
  await tx.wait();

  console.log("TrackComponent deployed and registered");
  console.log("trackComponentAddress", trackComponentAddress);
  console.log("trackComponentId", trackComponentId.toString(16));
  console.log("------------------------------------------");

  // set additional roles
  // set MANAGER_ROLE for manager account
  tx = await gameRegistry.connect(deployer).grantRole(MANAGER_ROLE, manager);
  await tx.wait();

  // unpause contracts
  tx = await gameRegistry.connect(deployer).setPaused(false);
  await tx.wait();

  tx = await raceSystem.connect(deployer).setPaused(false);
  await tx.wait();

  tx = await moveSystem.connect(deployer).setPaused(false);
  await tx.wait();

  return {
    raceSystem,
    moveSystem,
    trackSystem,
    gameRegistry,
    deployer,
    manager,
    acc1,
    acc2,
    acc3,
  };
}
