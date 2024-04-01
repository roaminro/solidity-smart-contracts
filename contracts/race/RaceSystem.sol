// SPDX-License-Identifier: UNKOWN
pragma solidity ^0.8.9;

import {ID as RACE_SYSTEM_ID, IRaceSystem, CreateRaceParams, JoinRaceParams, GetRaceParams, GetPlayerInfoParams, RaceStatus} from "./IRaceSystem.sol";
import {RaceComponent, ID as RACE_COMPONENT_ID, Layout as Race} from "../components/RaceComponent.sol";
import {Position2DComponent, ID as POSITION2D_COMPONENT_ID, Layout as Position} from "../components/Position2DComponent.sol";
import {Speed2DComponent, ID as SPEED2D_COMPONENT_ID} from "../components/Speed2DComponent.sol";
import {EnergyComponent, ID as ENERGY_COMPONENT_ID} from "../components/EnergyComponent.sol";
import "../GameRegistryConsumerUpgradeable.sol";
import {RaceLibrary} from "./RaceLibrary.sol";

/**
 * @title Contract for races
 */
contract RaceSystem is IRaceSystem, GameRegistryConsumerUpgradeable {
    /** EVENTS **/
    event RaceCreated(uint256 indexed raceID, address indexed creator);
    event RaceStarted(uint256 indexed raceID);
    event PlayerJoined(uint256 indexed raceID, address indexed player);

    /** ERRORS **/
    error RaceNotFound();
    error RaceAlreadyStarted();
    error PlayerAlreadyJoined();

    /**
     * Initializer for this upgradeable contract
     *
     * @param gameRegistryAddress Address of the GameRegistry contract
     */
    function initialize(address gameRegistryAddress) public initializer {
        __GameRegistryConsumer_init(gameRegistryAddress, RACE_SYSTEM_ID);
    }

    function _getRaceComponent() internal view returns (RaceComponent) {
        return RaceComponent(_gameRegistry.getComponent(RACE_COMPONENT_ID));
    }

    function _getPosition2DComponent()
        internal
        view
        returns (Position2DComponent)
    {
        return
            Position2DComponent(
                _gameRegistry.getComponent(POSITION2D_COMPONENT_ID)
            );
    }

    function _getSpeed2DComponent()
        internal
        view
        returns (Speed2DComponent)
    {
        return
            Speed2DComponent(
                _gameRegistry.getComponent(SPEED2D_COMPONENT_ID)
            );
    }

    function _getEnergyComponent()
        internal
        view
        returns (EnergyComponent)
    {
        return
            EnergyComponent(
                _gameRegistry.getComponent(ENERGY_COMPONENT_ID)
            );
    }

    function createRace(
        CreateRaceParams calldata params
    ) external whenNotPaused {
        address creator = _getPlayerAccount(_msgSender());

        // TODO: add requirements to create a race

        uint256 raceID = _gameRegistry.generateGUID();

        // create race
        _getRaceComponent().setValue(
            raceID,
            creator,
            uint8(RaceStatus.WAITING_FOR_PLAYERS),
            0,
            new address[](params.nbPlayers)
        );

        emit RaceCreated(raceID, creator);
    }

    function joinRace(JoinRaceParams calldata params) external whenNotPaused {
        address player = _getPlayerAccount(_msgSender());

        // TODO: add requirements to join a race

        RaceComponent raceComponent = _getRaceComponent();
        Race memory race = raceComponent.getLayoutValue(params.raceID);

        // check that the race exist
        if (race.status == uint8(RaceStatus.UNDEFINED)) {
            revert RaceNotFound();
        }

        // check that the race has not started yet
        if (race.status != uint8(RaceStatus.WAITING_FOR_PLAYERS)) {
            revert RaceAlreadyStarted();
        }

        uint256 racePlayerID = RaceLibrary.getRacePlayerEntity(
            params.raceID,
            player
        );

        Position memory position = _getPosition2DComponent().getLayoutValue(
            racePlayerID
        );

        // check if player already joined race
        // checking only x (or y) == 1 is enough to ensure the player has not joined yet
        if (position.x == 1) {
            revert PlayerAlreadyJoined();
        }

        // TODO: use a better way to store default player values

        // all players start at position (1,1)
        position.x = 1;
        position.y = 1;

        _getPosition2DComponent().setLayoutValue(racePlayerID, position);

        // start with a speed of 0
        _getSpeed2DComponent().setValue(racePlayerID, 0, 0);

         // start with:
         // - full energy (10000 = 100.00%)
         // - 5 seconds energy regeneration time
        _getEnergyComponent().setValue(racePlayerID, 100_00, 100_00, 0, 5 seconds);

        emit PlayerJoined(params.raceID, player);

        // update race
        race.players[race.nbPlayersJoined] = player;
        ++race.nbPlayersJoined;

        // start race if enough players joined
        if (race.nbPlayersJoined == race.players.length) {
            race.status = uint8(RaceStatus.STARTED);
            emit RaceStarted(params.raceID);
        }

        _getRaceComponent().setLayoutValue(params.raceID, race);
    }

    function getRace(GetRaceParams calldata params) external view returns (Race memory) {
        return _getRaceComponent().getLayoutValue(params.raceID);
    }

    function getPlayerInfo(
        GetPlayerInfoParams calldata params
    ) external view returns (int32 x, int32 y, int32 vx, int32 vy, uint32 energy) {
        uint256 racePlayerID = RaceLibrary.getRacePlayerEntity(
            params.raceID,
            params.player
        );

        (x, y) = _getPosition2DComponent().getValue(racePlayerID);
        (vx, vy) = _getSpeed2DComponent().getValue(racePlayerID);
        (energy,,,) = _getEnergyComponent().getValue(racePlayerID);
    }
}
