// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.9;

import {Position2DComponent, ID as POSITION_2D_COMPONENT_ID, Layout as Position} from "../components/Position2DComponent.sol";
import {Speed2DComponent, ID as SPEED_2D_COMPONENT_ID, Layout as Speed} from "../components/Speed2DComponent.sol";
import {RaceComponent, ID as RACE_COMPONENT_ID, Layout as Race} from "../components/RaceComponent.sol";
import {RaceStatus} from "../race/IRaceSystem.sol";
import {MANAGER_ROLE} from "../Constants.sol";
import {IMoveSystem, MoveParams, GetPositionParams} from "./IMoveSystem.sol";
import "../GameRegistryConsumerUpgradeable.sol";
import {RaceLibrary} from "../race/RaceLibrary.sol";

uint256 constant ID = uint256(keccak256("game.racing.movesystem.v1"));

/**
 * @title Contract for moves
 */
contract MoveSystem is IMoveSystem, GameRegistryConsumerUpgradeable {
    /** ERRORS **/
    error InvalidMove();
    error RaceNotStarted();
    error PlayerNotJoined();

    /** EVENTS **/
    event PlayerMoved(uint256 indexed raceID, address indexed player);

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

    function _getSpeed2DComponent() internal view returns (Speed2DComponent) {
        return
            Speed2DComponent(_gameRegistry.getComponent(SPEED_2D_COMPONENT_ID));
    }

    function _getRaceComponent() internal view returns (RaceComponent) {
        return RaceComponent(_gameRegistry.getSystem(RACE_COMPONENT_ID));
    }

    function move(MoveParams calldata params) external whenNotPaused {
        // check inputs
        // -1 <= vx <= 1
        // -1 <= vy <= 1
        if (
            params.vx < -1 || params.vx > 1 || params.vy < -1 || params.vy > 1
        ) {
            revert InvalidMove();
        }

        address player = _getPlayerAccount(_msgSender());

        // check that the race exist and that it's started
        RaceComponent raceComponent = _getRaceComponent();
        Race memory race = raceComponent.getLayoutValue(params.raceID);

        if (race.status != uint8(RaceStatus.STARTED)) {
            revert RaceNotStarted();
        }

        // check that the user has joined that race
        uint256 racePlayerID = RaceLibrary.getRacePlayerEntity(
            params.raceID,
            player
        );

        Position2DComponent positionComponent = _getPosition2DComponent();

        if (!positionComponent.has(racePlayerID)) {
            revert PlayerNotJoined();
        }

        Position memory position = positionComponent.getLayoutValue(
            racePlayerID
        );

        Speed2DComponent speedComponent = _getSpeed2DComponent();

        // update speed
        // current speed + 1 = acceleration
        // current speed - 1 = deceleration
        // current speed + 0 = keep same speed
        Speed memory speed = speedComponent.getLayoutValue(racePlayerID);
        speed.vx += params.vx;
        speed.vy += params.vy;

        speedComponent.setLayoutValue(racePlayerID, speed);

        position.x += speed.vx;
        position.y += speed.vy;

        positionComponent.setLayoutValue(racePlayerID, position);

        emit PlayerMoved(params.raceID, player);
    }

    function getPlayerInfo(
        GetPositionParams calldata params
    ) external view returns (int32 x, int32 y, int32 vx, int32 vy) {
        uint256 racePlayerID = RaceLibrary.getRacePlayerEntity(
            params.raceID,
            params.player
        );

        (x, y) = _getPosition2DComponent().getValue(racePlayerID);
        (vx, vy) = _getSpeed2DComponent().getValue(racePlayerID);
    }
}
