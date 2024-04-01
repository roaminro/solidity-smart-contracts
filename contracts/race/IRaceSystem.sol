// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.9;

import {Layout as Race} from "../components/RaceComponent.sol";

uint256 constant ID = uint256(keccak256("game.racing.racesystem.v1"));

struct CreateRaceParams {
    uint8 nbPlayers;
}

struct JoinRaceParams {
    uint256 raceID;
}

enum RaceStatus {
    UNDEFINED,
    WAITING_FOR_PLAYERS,
    STARTED,
    FINISHED
}

interface IRaceSystem  {
    function createRace(CreateRaceParams calldata params) external;

    function joinRace(JoinRaceParams calldata params) external;

    function getRace(uint256 raceID) view external returns (Race memory);
}
