// SPDX-License-Identifier: UNKOWN
pragma solidity ^0.8.9;

import {ID as TRACK_SYSTEM_ID, ITrackSystem, Track, LineSegment, Checkpoint} from "./ITrackSystem.sol";
import {TrackComponent, ID as TRACK_COMPONENT_ID, Layout as TrackLayout} from "../components/TrackComponent.sol";
import {CheckpointComponent, ID as CHECKPOINT_COMPONENT_ID, Layout as CheckpointLayout} from "../components/CheckpointComponent.sol";
import {LineSegment2DComponent, ID as LINE_SEGMENT2D_COMPONENT_ID} from "../components/LineSegment2DComponent.sol";
import "../GameRegistryConsumerUpgradeable.sol";
import {TrackLibrary} from "./TrackLibrary.sol";
import {MANAGER_ROLE} from "../Constants.sol";

/**
 * @title Contract for tracks
 */
contract TrackSystem is ITrackSystem, GameRegistryConsumerUpgradeable {
    /** EVENTS **/
    event TrackCreated(uint256 indexed trackID);

    /**
     * Initializer for this upgradeable contract
     *
     * @param gameRegistryAddress Address of the GameRegistry contract
     */
    function initialize(address gameRegistryAddress) public initializer {
        __GameRegistryConsumer_init(gameRegistryAddress, TRACK_SYSTEM_ID);
    }

    function _getLineSegment2DComponent()
        internal
        view
        returns (LineSegment2DComponent)
    {
        return
            LineSegment2DComponent(
                _gameRegistry.getComponent(LINE_SEGMENT2D_COMPONENT_ID)
            );
    }

    function _getCheckpointComponent()
        internal
        view
        returns (CheckpointComponent)
    {
        return
            CheckpointComponent(
                _gameRegistry.getComponent(CHECKPOINT_COMPONENT_ID)
            );
    }

    function _getTrackComponent() internal view returns (TrackComponent) {
        return TrackComponent(_gameRegistry.getComponent(TRACK_COMPONENT_ID));
    }

    function _storeLineSegmentEntities(
        LineSegment[] memory lineSegments
    ) internal returns (uint256[] memory) {
        uint256[] memory lineEntities = new uint256[](lineSegments.length);
        LineSegment2DComponent lineSegment2DComponent = _getLineSegment2DComponent();

        LineSegment memory line;
        uint256 lineSegmentID;
        for (uint256 i; i < lineSegments.length; ) {
            // TODO: revert if line segment's points are the same? technically it doesn't matter so much in the contract
            line = lineSegments[i];
            lineSegmentID = TrackLibrary.getLineSegmentEntity(line);

            // to save on storage cost, check if line segment does not exist yet (from a previous track)
            // add it to storage
            if (!lineSegment2DComponent.has(lineSegmentID)) {
                lineSegment2DComponent.setValue(
                    lineSegmentID,
                    line.x1,
                    line.y1,
                    line.x2,
                    line.y2
                );
            }

            lineEntities[i] = lineSegmentID;

            unchecked {
                ++i;
            }
        }

        return lineEntities;
    }

    function _storeCheckpointEntities(
        uint256 trackID,
        Checkpoint[] calldata checkpoints
    ) internal returns (uint256[] memory) {
        uint256[] memory checkpointEntities = new uint256[](checkpoints.length);
        CheckpointComponent checkpointComponent = _getCheckpointComponent();

        Checkpoint memory checkpoint;
        uint256 checkpointID;
        for (uint256 i; i < checkpoints.length; ) {
            checkpoint = checkpoints[i];
            // a checkpoint ID is built by encoding the trackID and the checkpoint index + 1
            // (there is no checkpoint "0")
            // we assume that the checkpoints are sorted in ascending order
            checkpointID = TrackLibrary.getTrackCheckpointEntity(
                trackID,
                i + 1
            );

            checkpointComponent.setValue(
                checkpointID,
                // a checkpoint can be represented using several lines
                // this allows for creating alternative routes in the track
                _storeLineSegmentEntities(checkpoint.lines)
            );

            checkpointEntities[i] = checkpointID;

            unchecked {
                ++i;
            }
        }

        return checkpointEntities;
    }

    function createTrack(Track calldata track) external onlyRole(MANAGER_ROLE) {
        uint256 trackID = _gameRegistry.generateGUID();

        // process the lines
        uint256[] memory lineEntities = _storeLineSegmentEntities(track.lines);

        // process the checkpoints
        uint256[] memory checkpointEntities = _storeCheckpointEntities(
            trackID,
            track.checkpoints
        );

        // save the track
        _getTrackComponent().setValue(
            trackID,
            lineEntities,
            checkpointEntities
        );

        emit TrackCreated(trackID);
    }

    function _getLineSegments(uint256[] memory lineSegmentEntities) internal view returns (LineSegment[] memory) {
        LineSegment[] memory lineSegments = new LineSegment[](lineSegmentEntities.length);

        LineSegment2DComponent lineSegment2DComponent = _getLineSegment2DComponent();

        for (uint i; i < lineSegmentEntities.length;) {
            lineSegments[i] = lineSegment2DComponent.getLayoutValue(lineSegmentEntities[i]);

            unchecked {
                ++i;
            }
        }

        return lineSegments;
    }

    function _getTrackCheckpoints(uint256 trackID, uint256[] memory checkpointEntities) internal view returns (Checkpoint[] memory) {
        Checkpoint[] memory checkpoints = new Checkpoint[](checkpointEntities.length);

        CheckpointComponent checkpointComponent = _getCheckpointComponent();

        CheckpointLayout memory checkpointLayout;
        for (uint i; i < checkpointEntities.length;) {
            checkpointLayout = checkpointComponent.getLayoutValue(TrackLibrary.getTrackCheckpointEntity(
                trackID,
                i + 1
            ));

            checkpoints[i] = Checkpoint({
                lines: _getLineSegments(checkpointLayout.lineEntities)
            });

            unchecked {
                ++i;
            }
        }

        return checkpoints;
    }

    function getTrack(
        uint256 trackID
    ) external view returns (Track memory) {
        TrackComponent trackComponent = _getTrackComponent();

        TrackLayout memory track = trackComponent.getLayoutValue(trackID);

       return Track({
        lines: _getLineSegments(track.lineEntities),
        checkpoints: _getTrackCheckpoints(trackID, track.checkpointEntities)
       });
    }
}
