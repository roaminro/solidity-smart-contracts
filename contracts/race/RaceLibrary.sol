// SPDX-License-Identifier: UNKOWN
pragma solidity ^0.8.24;

library RaceLibrary {
    function getRacePlayerEntity(
        uint256 raceID,
        address player
    ) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(raceID, player)));
    }
}