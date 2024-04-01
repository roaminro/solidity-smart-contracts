// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

struct MoveParams {
    uint256 raceID;
    int32 vx;
    int32 vy;
}

struct GetPositionParams {
    uint256 raceID;
    address player;
}

interface IMoveSystem {
    function move(MoveParams calldata params) external;

    function getPlayerInfo(
        GetPositionParams calldata params
    ) external returns (int32 x, int32 y, int32 vx, int32 vy);
}
