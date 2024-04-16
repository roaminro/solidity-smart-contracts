import hre from "hardhat";

export const DEPLOYER_ROLE = hre.ethers.solidityPackedKeccak256(
  ["string"],
  ["DEPLOYER_ROLE"]
);

export const MANAGER_ROLE = hre.ethers.solidityPackedKeccak256(
  ["string"],
  ["MANAGER_ROLE"]
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

/*
 * Test track
 *              (0,30)             (30,30)
 *              ┌────────────────────────┐
 *              │                        │
 *              │    (5,25)   (25,25)    │
 *        (0,25)├----┬──────────────┬----┤(30,25)
 *              │ ▲  │              │ ▲  │
 *              │ │  │              │ │  │ checkpoint 2
 *  checkpoint 1│ │  │              │ └──┼──────
 *        ──────┼─┘  │              │    │
 *              │    │              │    │
 *              │    │              │    │
 *              │    │(5,5)   (25,5)│    │
 * finish line  │    ├──────────────┤    │
 *        ──────┼───►│              │    │ checkpoint 3
 *  start ──────┼►x  │              │ ◄──┼──────
 *  position    └────┴──────────────┴────┘
 *          (0,0)    (5,0)     (25,0)    (30,0)
 */

export const TRACK = {
  lines: [
    // outer lines
    { x1: 0, y1: 0, x2: 0, y2: 30 },
    { x1: 0, y1: 30, x2: 30, y2: 30 },
    { x1: 30, y1: 30, x2: 30, y2: 0 },
    { x1: 30, y1: 0, x2: 0, y2: 0 },

    // inner lines
    { x1: 5, y1: 5, x2: 5, y2: 25 },
    { x1: 5, y1: 25, x2: 25, y2: 25 },
    { x1: 25, y1: 25, x2: 25, y2: 5 },
    { x1: 25, y1: 5, x2: 5, y2: 5 },
  ],
  checkpoints: [
    // checkpoint 1
    {
      lines: [{ x1: 0, y1: 25, x2: 5, y2: 25 }],
    },
    // checkpoint 2
    {
      lines: [{ x1: 25, y1: 25, x2: 30, y2: 25 }],
    },
    // checkpoint 3
    {
      lines: [{ x1: 25, y1: 5, x2: 25, y2: 0 }],
    },
    // finish line / checkpoint 4
    {
      lines: [{ x1: 5, y1: 5, x2: 5, y2: 0 }],
    },
  ],
};