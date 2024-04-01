// SPDX-License-Identifier: UNKOWN
pragma solidity ^0.8.24;

struct MoveParams {
    uint256 raceID;
    int32 vx;
    int32 vy;
}

interface IMoveSystem {
    function move(MoveParams calldata params) external;
}
