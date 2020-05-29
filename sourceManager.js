const initialHarvesterCount = 4;
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
function staticHarvester(energy) {
  if (energy >= 750) {
    return [
      WORK,
      WORK,
      WORK,
      WORK,
      WORK,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      CARRY,
      MOVE,
    ];
  } else if (energy >= 650) {
    return [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE];
  } else if (energy >= 550) {
    return [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
  } else {
    return scaleBalancedCreep(energy);
  }
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
    const container = source.pos.findInRange(FIND_STRUCTURES, 2, {
      filter: (s) => s.structureType === STRUCTURE_CONTAINER,
    })[0];
    const energyCap = source.room.energyCapacityAvailable;
    const harvesterSum = sumSourceHarvester(source);
    const spawn = "Spawn1";
    if (container) {
      if (harvesterSum < 1) {
        Memory[spawn] = makeHarvester(staticHarvester(energyCap), source);
      }
    } else {
      if (harvesterSum < 1) {
        Memory[spawn] = makeHarvester(emergencyHarvester(), source);
      } else if (harvesterSum < initialHarvesterCount) {
        Memory[spawn] = makeHarvester(scaleBalancedCreep(energyCap), source);
      }
    }
  },
};
