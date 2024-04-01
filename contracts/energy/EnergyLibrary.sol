// SPDX-License-Identifier: UNKOWN 
pragma solidity ^0.8.24;

import {Layout as Energy} from "../components/EnergyComponent.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

library EnergyLibrary {
    function regenerateEnergy(uint32 timestamp, Energy memory energy) internal pure {
        uint32 elapsedTime = uint32(Math.min(timestamp - energy.lastUpdate, energy.regenerationTime));
        // upcast and then downcast multiplication to prevent overflow
        uint32 newEnergy = energy.balance + SafeCast.toUint32(uint64(elapsedTime) * uint64(energy.max)) / energy.regenerationTime;
        
        energy.balance = uint32(Math.min(newEnergy, energy.max));
        energy.lastUpdate = timestamp;
    }
}