// SPDX-License-Identifier: UNKOWN
pragma solidity ^0.8.9;

import {Layout as LineSegment} from "../components/LineSegment2DComponent.sol";

uint256 constant ID = uint256(keccak256("game.racing.tracksystem.v1"));

struct Checkpoint {
    LineSegment[] lines;
}

struct Track {
    LineSegment[] lines;
    Checkpoint[] checkpoints;
}

interface ITrackSystem {
    function createTrack(Track calldata track) external;
    function getTrack(uint256 trackID) external view returns (Track memory);
}
