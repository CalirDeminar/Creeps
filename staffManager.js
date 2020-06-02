const sourceManager = require("sourceManager");
function sumRole(role) {
  return _.sum(Game.creeps, (c) => c.memory.role === role);
}
function sumSourceHarvester(source) {
  return _.sum(
    Game.creeps,
    (c) => c.memory.role === "harvester" && c.memory.target === source.id
  );
}
function emergencyHarvester() {
  return [WORK, CARRY, MOVE];
}
function scaleBalancedCreep(energy) {
  const noParts = Math.floor(energy / 200);
  let body = [];
  for (let i = 0; i < noParts; i++) {
    body.push(WORK);
    body.push(MOVE);
    body.push(CARRY);
  }
  return body;
}
function scaleHaulingCreep(energy) {
  const noParts = Math.floor(energy / 150);
  let body = [];
  for (let i = 0; i < noParts; i++) {
    body.push(CARRY);
    body.push(CARRY);
    body.push(MOVE);
  }
  return body;
}
function checkVacancies(spawn) {
  const spawnObj = Game.spawns[spawn];
  let buildQueue = Memory[spawnObj.room.name].buildQueue;
  const room = spawnObj.room;
  const controllerObj = room.controller;
  const controllerDistance = controllerObj.pos.findPathTo(spawnObj).length;
  const sources = room.find(FIND_SOURCES);
  const containers = room.find(FIND_STRUCTURES, {
    filter: { structureType: STRUCTURE_CONTAINER },
  });
  const energyCap = room.energyCapacityAvailable;
  const currentEnergy = spawnObj.room.energyAvailable;
  const harvestersPerSource = 4;
  const totalHarvesters = harvestersPerSource * sources.length;
  const upgraders = 2;
  const builders = 2;
  const repairers = 1;
  const scout = Object.keys(Game.flags).length > 0 ? 1 : 0;
  const remoteHarvester = 0;
  if (Memory[spawn] === undefined) {
    if (sumRole("upgrader") < upgraders) {
      Memory[spawn] = {
        template: scaleBalancedCreep(energyCap),
        memory: { role: "upgrader", target: undefined, working: false },
      };
    } else if (sumRole("builder") < builders) {
      Memory[spawn] = {
        template: scaleBalancedCreep(energyCap),
        memory: { role: "builder", target: undefined, working: false },
      };
    } else if (sumRole("repairer") < repairers) {
      Memory[spawn] = {
        template: scaleBalancedCreep(energyCap),
        memory: { role: "repairer", target: undefined, working: false },
      };
    } else if (sumRole("scout") < scout) {
      Memory[spawn] = { template: [MOVE], memory: { role: "scout" } };
    } else {
      const stoppedRemote = _.findIndex(
        Memory.remotes,
        (r) => r.lastSpawned === undefined || Game.time - r.lastSpawned > 1500
      );
      if (stoppedRemote != -1) {
        console.log(stoppedRemote);
        Memory[spawn] = {
          template: scaleBalancedCreep(energyCap),
          memory: {
            role: "remoteHarvester",
            targetRoom: Memory.remotes[stoppedRemote].roomName,
            targetSource: Memory.remotes[stoppedRemote].sourceId,
            home: spawnObj.pos.roomName,
            working: false,
          },
        };
        Memory.remotes[stoppedRemote].lastSpawned = Game.time;
        // TODO - move this to the spawning code
        // - figure out why we're spawning > remoteHarvester per remote
      }
    }
  }
}
function fillVacancies(spawn) {
  const spawnObj = Game.spawns[spawn];
  const toDo = Memory[spawn];
  if (toDo !== undefined) {
    const resp = spawnObj.createCreep(toDo.template, undefined, toDo.memory);
    if (!Number.isInteger(resp)) {
      Memory[spawn] = undefined;
    }
  }
}
module.exports = {
  run: function () {
    for (let spawn in Game.spawns) {
      checkVacancies(spawn);
      fillVacancies(spawn);
    }
  },
};
