// SPDX-License-Identifier: UNKOWN

pragma solidity ^0.8.9;

import {Layout as Race} from "../components/RaceComponent.sol";

uint256 constant ID = uint256(keccak256("game.racing.racesystem.v1"));

struct CreateRaceParams {
    uint256 trackID;
    uint8 nbPlayers;
}

struct JoinRaceParams {
    uint256 raceID;
}

struct GetRaceParams {
    uint256 raceID;
}

struct GetPlayerInfoParams {
    uint256 raceID;
    address player;
}

struct PlayerInfo{
    int32 x;
    int32 y;
    int32 vx; 
    int32 vy; 
    uint32 energy;
}

enum RaceStatus {
    UNDEFINED,
    WAITING_FOR_PLAYERS,
    STARTED,
    FINISHED
}

interface IRaceSystem {
    function createRace(CreateRaceParams calldata params) external;

    function joinRace(JoinRaceParams calldata params) external;

    function getRace(GetRaceParams calldata params) external view returns (Race memory);

    function getPlayerInfo(
        GetPlayerInfoParams calldata params
    ) external returns (PlayerInfo memory playerInfo);
}
