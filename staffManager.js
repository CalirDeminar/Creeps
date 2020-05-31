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
  const noParts = Math.floor((energy - 100) / 150);
  let body = energy < 350 ? [CARRY] : [CARRY, CARRY];
  for (let i = 0; i < noParts; i++) {
    body.push(WORK);
    body.push(MOVE);
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
  if (Memory[spawn] === undefined) {
    if (sumRole("upgrader") < upgraders) {
      Memory[spawn] = {
        template: scaleBalancedCreep(energyCap),
        memory: { role: "upgrader", target: undefined, working: false },
      };
      //buildQueue.push({
      //  template: scaleBalancedCreep(energyCap),
      //  memory: { role: "upgrader", target: undefined, working: false },
      //});
    } else if (sumRole("builder") < builders) {
      Memory[spawn] = {
        template: scaleBalancedCreep(energyCap),
        memory: { role: "builder", target: undefined, working: false },
      };
      //buildQueue.push({
      //  template: scaleBalancedCreep(energyCap),
      //  memory: { role: "builder", target: undefined, working: false },
      //});
    } else if (sumRole("repairer") < repairers) {
      Memory[spawn] = {
        template: scaleBalancedCreep(energyCap),
        memory: { role: "repairer", target: undefined, working: false },
      };
      //buildQueue.push({
      //  template: scaleBalancedCreep(energyCap),
      //  memory: { role: "repairer", target: undefined, working: false },
      //});
    }
    //Memory[spawnObj.room.name].buildQueue = buildQueue;
    for (let sourceName in sources) {
      const source = sources[sourceName];
      sourceManager.harvesterSetup(source);
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
