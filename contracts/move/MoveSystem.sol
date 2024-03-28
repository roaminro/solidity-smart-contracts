// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.9;

import {Position2DComponent, ID as POSITION_2D_COMPONENT_ID} from "../components/Position2DComponent.sol";
import {MANAGER_ROLE} from "../Constants.sol";
import "../GameRegistryConsumerUpgradeable.sol";
import {EntityLibrary} from "../core/EntityLibrary.sol";

uint256 constant ID = uint256(keccak256("game.mygame.movesystem"));

/**
 * @title Contract for moves
 */
contract MoveSystem is GameRegistryConsumerUpgradeable {
    /**
     * Initializer for this upgradeable contract
     *
     * @param gameRegistryAddress Address of the GameRegistry contract
     */
    function initialize(address gameRegistryAddress) public initializer {
        __GameRegistryConsumer_init(gameRegistryAddress, ID);
    }

    function _getPosition2DComponent()
        internal
        view
        returns (Position2DComponent)
    {
        return
            Position2DComponent(
                _gameRegistry.getComponent(POSITION_2D_COMPONENT_ID)
            );
    }

    function setPosition(int64 x, int64 y) external {
        address account = _getPlayerAccount(_msgSender());

        Position2DComponent positionComponent = _getPosition2DComponent();

        positionComponent.setValue(
            EntityLibrary.addressToEntity(account),
            x,
            y
        );
    }

    function getPosition(
        address account
    ) external view returns (int64 x, int64 y) {
        uint256 entity = EntityLibrary.addressToEntity(account);

        Position2DComponent positionComponent = _getPosition2DComponent();

        (x, y) = positionComponent.getValue(entity);
    }
}
