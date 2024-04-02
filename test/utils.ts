import hre from "hardhat";

export const DEPLOYER_ROLE = hre.ethers.solidityPackedKeccak256(
  ["string"],
  ["DEPLOYER_ROLE"]
);

export const PAUSER_ROLE = hre.ethers.solidityPackedKeccak256(
  ["string"],
  ["PAUSER_ROLE"]
);

export const GAME_LOGIC_CONTRACT_ROLE = hre.ethers.solidityPackedKeccak256(
  ["string"],
  ["GAME_LOGIC_CONTRACT_ROLE"]
);

export enum RaceStatus {
  UNDEFINED,
  WAITING_FOR_PLAYERS,
  STARTED,
  FINISHED,
}
