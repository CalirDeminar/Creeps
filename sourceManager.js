const initialHarvesterCount = 4;
const constructionManager = require("constructionManager");
function sumSourceHarvester(source) {
  return _.sum(
    Game.creeps,
    (c) => c.memory.role === "harvester" && c.memory.target === source.id
  );
}
function makeHarvester(template, source) {
  return {
    template: template,
    memory: { role: "harvester", target: source.id, working: false },
  };
}
function sumRole(role) {
  return _.sum(Game.creeps, (c) => c.memory.role === role);
}
function staticHarvester(energy) {
  const workParts = Math.floor((energy - 150) / 100);
  let body = [CARRY, MOVE, MOVE];
  if (workParts >= 4) {
    for (let i = 0; i < workParts && i < 6; i++) {
      body.push(WORK);
    }
    return body;
  } else {
    return scaleBalancedCreep(energy);
  }
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
function emergencyHarvester() {
  return [WORK, CARRY, MOVE];
}
function scaleBalancedCreep(energy) {
  const noParts = Math.floor(energy / 200);
  let body = [];
  for (let i = 0; i < noParts; i++) {
    body.push(WORK);
    body.push(CARRY);
    body.push(MOVE);
  }
  return body;
}
module.exports = {
  harvesterSetup: function (source) {
    const roomId = source.room.name;
    let buildQueue = Memory[roomId].buildQueue;
    const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER,
    })[0];
    const energyCap = source.room.energyCapacityAvailable;
    const harvesterSum = sumSourceHarvester(source);
    const harvesters = _.filter(
      Game.creeps,
      (c) => c.memory.target === source.id
    );
    const spawn = "Spawn1";
    if (container) {
      // spawn harvester if harvester is missing or has < 100 ticks to live
      if (
        harvesters.length < 1 ||
        (harvesters.length === 1 && harvesters[0].ticksToLive < 100)
      ) {
        Memory[spawn] = makeHarvester(staticHarvester(energyCap), source);
        //buildQueue.push(makeHarvester(staticHarvester(energyCap), source));
      } else {
        const haulers = _.filter(
          Game.creeps,
          (c) => c.memory.role === "hauler" && c.memory.target === container.id
        );
        if (
          haulers.length === 0 ||
          (haulers.length === 1 && haulers[0].ticksToLive < 100)
        ) {
          Memory[spawn] = {
            template: scaleHaulingCreep(energyCap),
            memory: { role: "hauler", target: container.id, working: false },
          };
          //buildQueue.push({
          //  template: scaleHaulingCreep(energyCap),
          //  memory: { role: "hauler", target: container.id, working: false },
          //});
        }
      }
    } else {
      if (harvesters.length < 1) {
        Memory[spawn] = makeHarvester(emergencyHarvester(), source);
        //buildQueue.push(makeHarvester(emergencyHarvester(), source));
      } else if (harvesters.length < initialHarvesterCount) {
        Memory[spawn] = makeHarvester(scaleBalancedCreep(energyCap), source);
        //buildQueue.push(makeHarvester(scaleBalancedCreep(energyCap), source));
      }
    }
    //Memory[roomId].buildQueue = buildQueue;
  },
};
