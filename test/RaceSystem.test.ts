import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { EventLog } from "ethers";
import { RaceStatus } from "./utils";
import { commonFixtures } from "./fixtures/common";

describe("RaceSystem", function () {
  it("Should create a race", async function () {
    const { raceSystem, acc1 } = await loadFixture(commonFixtures);

    let tx = await raceSystem.connect(acc1).createRace({
      nbPlayers: 3,
    });

    let receipt = await tx.wait();

    await expect(tx)
      .to.emit(raceSystem, "RaceCreated")
      .withArgs(anyValue, acc1);

    let event = receipt?.logs.find(
      (log) => log instanceof EventLog && log.eventName === "RaceCreated"
    ) as EventLog;

    let [raceID] = event.args;

    let race = await raceSystem.getRace({
      raceID,
    });
    expect(race.creator).to.eq(acc1);
    expect(race.status).to.eq(RaceStatus.WAITING_FOR_PLAYERS);
    expect(race.nbPlayersJoined).to.eq(0);
    expect(race.players).to.deep.eq([
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
    ]);
  });

  it("Should join and start a race", async function () {
    const { raceSystem, acc1, acc2 } = await loadFixture(commonFixtures);

    let tx = await raceSystem.connect(acc1).createRace({
      nbPlayers: 2,
    });

    let receipt = await tx.wait();

    let event = receipt?.logs.find(
      (log) => log instanceof EventLog && log.eventName === "RaceCreated"
    ) as EventLog;

    let [raceID] = event.args;

    tx = await raceSystem.connect(acc1).joinRace({
      raceID,
    });

    receipt = await tx.wait();

    expect(tx).to.emit(raceSystem, "PlayerJoined").withArgs(raceID, acc1);

    let race = await raceSystem.getRace({
      raceID,
    });
    expect(race.creator).to.eq(acc1);
    expect(race.status).to.eq(RaceStatus.WAITING_FOR_PLAYERS);
    expect(race.nbPlayersJoined).to.eq(1);
    expect(race.players).to.deep.eq([
      acc1.address,
      "0x0000000000000000000000000000000000000000",
    ]);

    tx = await raceSystem.connect(acc2).joinRace({
      raceID,
    });

    receipt = await tx.wait();

    expect(tx).to.emit(raceSystem, "PlayerJoined").withArgs(raceID, acc2);
    expect(tx).to.emit(raceSystem, "RaceStarted").withArgs(raceID);

    race = await raceSystem.getRace({
      raceID,
    });
    expect(race.creator).to.eq(acc1);
    expect(race.status).to.eq(RaceStatus.STARTED);
    expect(race.nbPlayersJoined).to.eq(2);
    expect(race.players).to.deep.eq([acc1.address, acc2.address]);

    let playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc1,
    });

    expect(playerInfo.x).to.eq(1);
    expect(playerInfo.y).to.eq(1);
    expect(playerInfo.vx).to.eq(0);
    expect(playerInfo.vy).to.eq(0);
    expect(playerInfo.energy).to.eq(100_00);

    playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc2,
    });

    expect(playerInfo.x).to.eq(1);
    expect(playerInfo.y).to.eq(1);
    expect(playerInfo.vx).to.eq(0);
    expect(playerInfo.vy).to.eq(0);
    expect(playerInfo.energy).to.eq(100_00);
  });

  it("Should not join a race", async function () {
    const { deployer, raceSystem, acc1, acc2, acc3 } = await loadFixture(
      commonFixtures
    );

    let tx = await raceSystem.connect(acc1).createRace({
      nbPlayers: 2,
    });

    let receipt = await tx.wait();

    let event = receipt?.logs.find(
      (log) => log instanceof EventLog && log.eventName === "RaceCreated"
    ) as EventLog;

    let [raceID] = event.args;

    await expect(
      raceSystem.connect(acc1).joinRace({
        raceID: 1,
      })
    ).to.revertedWithCustomError(raceSystem, "RaceNotFound");

    tx = await raceSystem.connect(acc1).joinRace({
      raceID,
    });

    receipt = await tx.wait();

    await expect(
      raceSystem.connect(acc1).joinRace({
        raceID,
      })
    ).to.revertedWithCustomError(raceSystem, "PlayerAlreadyJoined");

    tx = await raceSystem.connect(acc2).joinRace({
      raceID,
    });

    receipt = await tx.wait();

    await expect(
      raceSystem.connect(acc3).joinRace({
        raceID,
      })
    ).to.revertedWithCustomError(raceSystem, "RaceAlreadyStarted");

    // pause MoveSystem
    tx = await raceSystem.connect(deployer).setPaused(true);
    await tx.wait();

    await expect(
      raceSystem.connect(acc2).createRace({
        nbPlayers: 2,
      })
    ).to.revertedWith("Pausable: paused");

    await expect(
      raceSystem.connect(acc2).joinRace({
        raceID,
      })
    ).to.revertedWith("Pausable: paused");

    await expect(
      raceSystem.connect(acc2).initialize(acc2.address)
    ).to.revertedWith("Initializable: contract is already initialized");
  });
});
