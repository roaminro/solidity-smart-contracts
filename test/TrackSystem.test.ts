import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { EventLog } from "ethers";
import { RaceStatus } from "./utils";
import { deployFixture } from "./fixtures";

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

const TRACK = {
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

describe("TrackSystem", function () {
  it("Should create a track", async function () {
    const { trackSystem, manager } = await loadFixture(deployFixture);

    let tx = await trackSystem.connect(manager).createTrack(TRACK);

    let receipt = await tx.wait();

    await expect(tx).to.emit(trackSystem, "TrackCreated").withArgs(anyValue);

    let event = receipt?.logs.find(
      (log) => log instanceof EventLog && log.eventName === "TrackCreated"
    ) as EventLog;

    const [trackID] = event.args;

    const track = await trackSystem.getTrack(trackID);

    track.lines.forEach((line, lineIdx) => {
      expect(line.x1).to.eq(TRACK.lines[lineIdx].x1);
      expect(line.y1).to.eq(TRACK.lines[lineIdx].y1);
      expect(line.x2).to.eq(TRACK.lines[lineIdx].x2);
      expect(line.y2).to.eq(TRACK.lines[lineIdx].y2);
    });

    track.checkpoints.forEach((checkpoint, checkPointIdx) => {
      checkpoint.lines.forEach((line, lineIdx) => {
        expect(line.x1).to.eq(
          TRACK.checkpoints[checkPointIdx].lines[lineIdx].x1
        );
        expect(line.y1).to.eq(
          TRACK.checkpoints[checkPointIdx].lines[lineIdx].y1
        );
        expect(line.x2).to.eq(
          TRACK.checkpoints[checkPointIdx].lines[lineIdx].x2
        );
        expect(line.y2).to.eq(
          TRACK.checkpoints[checkPointIdx].lines[lineIdx].y2
        );
      });
    });
  });
});
