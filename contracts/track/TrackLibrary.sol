// SPDX-License-Identifier: UNKOWN
pragma solidity ^0.8.24;

import {LineSegment} from "./ITrackSystem.sol";

library TrackLibrary {
    function getLineSegmentEntity(
        LineSegment memory line
    ) internal pure returns (uint256) {
        return
            uint256(
                keccak256(abi.encodePacked(line.x1, line.y1, line.x2, line.y2))
            );
    }

    function getTrackCheckpointEntity(
        uint256 trackID,
        uint256 checkpointID
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(trackID, checkpointID)));
    }
}
