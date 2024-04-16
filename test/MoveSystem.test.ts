import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { EventLog } from "ethers";
import { commonFixtures } from "./fixtures/common";

describe("MoveSystem", function () {
  it("Should move a player", async function () {
    const { raceSystem, moveSystem, acc1, acc2 } = await loadFixture(
      commonFixtures
    );

    // create race
    let tx = await raceSystem.connect(acc1).createRace({
      nbPlayers: 2,
    });

    let receipt = await tx.wait();

    let event = receipt?.logs.find(
      (log) => log instanceof EventLog && log.eventName === "RaceCreated"
    ) as EventLog;

    let [raceID] = event.args;

    // make player 1 join
    tx = await raceSystem.connect(acc1).joinRace({
      raceID,
    });

    await tx.wait();

    // make player 2 join
    tx = await raceSystem.connect(acc2).joinRace({
      raceID,
    });

    await tx.wait();

    // check player 1 info
    let playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc1,
    });

    expect(playerInfo.x).to.eq(1);
    expect(playerInfo.y).to.eq(1);
    expect(playerInfo.vx).to.eq(0);
    expect(playerInfo.vy).to.eq(0);
    expect(playerInfo.energy).to.eq(100_00);

    // race is now started, move player 1
    tx = await moveSystem.connect(acc1).move({
      raceID,
      vx: 1, // accelerate on x axis
      vy: 1, // accelerate on y axis
    });

    await expect(tx).to.emit(moveSystem, "PlayerMoved").withArgs(raceID, acc1);

    // check player 1 info
    playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc1,
    });

    expect(playerInfo.x).to.eq(2);
    expect(playerInfo.y).to.eq(2);
    expect(playerInfo.vx).to.eq(1);
    expect(playerInfo.vy).to.eq(1);
    expect(playerInfo.energy).to.eq(0);

    // increase block time to regenerate energy
    await time.increase(2);

    playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc1,
    });

    expect(playerInfo.energy).to.eq(40_00);

    // trying to move should revert
    await expect(
      moveSystem.connect(acc1).move({
        raceID,
        vx: 1,
        vy: 1,
      })
    ).to.revertedWithCustomError(moveSystem, "NotEnoughEnergy");

    // increase block time to regenerate energy
    await time.increase(2);

    playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc1,
    });

    expect(playerInfo.energy).to.eq(100_00);

    tx = await moveSystem.connect(acc1).move({
      raceID,
      vx: -1, // decelerate on x axis
      vy: 1, // accelerate on y axis
    });

    // check player 1 info
    playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc1,
    });

    expect(playerInfo.x).to.eq(2);
    expect(playerInfo.y).to.eq(4);
    expect(playerInfo.vx).to.eq(0);
    expect(playerInfo.vy).to.eq(2);
    expect(playerInfo.energy).to.eq(0);

    tx = await moveSystem.connect(acc2).move({
      raceID,
      vx: 1, // decelerate on x axis
      vy: 1, // accelerate on y axis
    });

    await tx.wait();

    // check player 2 info
    playerInfo = await raceSystem.getPlayerInfo({
      raceID,
      player: acc2,
    });

    expect(playerInfo.x).to.eq(2);
    expect(playerInfo.y).to.eq(2);
    expect(playerInfo.vx).to.eq(1);
    expect(playerInfo.vy).to.eq(1);
    expect(playerInfo.energy).to.eq(0);
  });

  it("Should not move a player", async function () {
    const { deployer, raceSystem, moveSystem, acc1, acc2, acc3 } =
      await loadFixture(commonFixtures);

    // create race
    let tx = await raceSystem.connect(acc1).createRace({
      nbPlayers: 2,
    });

    let receipt = await tx.wait();

    let event = receipt?.logs.find(
      (log) => log instanceof EventLog && log.eventName === "RaceCreated"
    ) as EventLog;

    let [raceID] = event.args;

    // make player 1 join
    tx = await raceSystem.connect(acc1).joinRace({
      raceID,
    });

    await tx.wait();

    // try to move player 1
    await expect(
      moveSystem.connect(acc1).move({
        raceID,
        vx: 1, // accelerate on x axis
        vy: 1, // accelerate on y axis
      })
    ).to.revertedWithCustomError(moveSystem, "RaceNotStarted");

    // make player 2 join
    tx = await raceSystem.connect(acc2).joinRace({
      raceID,
    });

    await tx.wait();

    // try to move player 1
    await expect(
      moveSystem.connect(acc1).move({
        raceID,
        vx: 2, // accelerate on x axis
        vy: 1, // accelerate on y axis
      })
    ).to.revertedWithCustomError(moveSystem, "InvalidMove");

    // try to move player 1
    await expect(
      moveSystem.connect(acc1).move({
        raceID,
        vx: 1, // accelerate on x axis
        vy: 2, // accelerate on y axis
      })
    ).to.revertedWithCustomError(moveSystem, "InvalidMove");

    // try to move player 1
    await expect(
      moveSystem.connect(acc1).move({
        raceID,
        vx: -2, // accelerate on x axis
        vy: 0, // accelerate on y axis
      })
    ).to.revertedWithCustomError(moveSystem, "InvalidMove");

    // try to move player 1
    await expect(
      moveSystem.connect(acc1).move({
        raceID,
        vx: 1, // accelerate on x axis
        vy: -2, // accelerate on y axis
      })
    ).to.revertedWithCustomError(moveSystem, "InvalidMove");

    // try to move player that has not joined
    await expect(
      moveSystem.connect(acc3).move({
        raceID,
        vx: 1, // accelerate on x axis
        vy: 1, // accelerate on y axis
      })
    ).to.revertedWithCustomError(moveSystem, "PlayerNotJoined");

    // move player 2
    tx = await moveSystem.connect(acc2).move({
      raceID,
      vx: 1, // decelerate on x axis
      vy: 1, // accelerate on y axis
    });

    await tx.wait();

    // try to move player 2 again right away
    await expect(
      moveSystem.connect(acc2).move({
        raceID,
        vx: 1, // decelerate on x axis
        vy: 1, // accelerate on y axis
      })
    ).to.revertedWithCustomError(moveSystem, "NotEnoughEnergy");

    // pause MoveSystem
    tx = await moveSystem.connect(deployer).setPaused(true);
    await tx.wait();

    await expect(
      moveSystem.connect(acc2).move({
        raceID,
        vx: 1, // decelerate on x axis
        vy: 1, // accelerate on y axis
      })
    ).to.revertedWith("Pausable: paused");

    await expect(
        moveSystem.connect(acc2).initialize(acc2.address)
      ).to.revertedWith("Initializable: contract is already initialized");
  });
});
