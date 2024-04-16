import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { EventLog } from "ethers";
import { TRACK } from "./utils";
import { commonFixtures } from "./fixtures/common";


describe("TrackSystem", function () {
  it("Should create a track", async function () {
    const { trackSystem, defaultTrackID } = await loadFixture(commonFixtures);

    const track = await trackSystem.getTrack(defaultTrackID);

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
