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
    body.push(CARRY);
    body.push(MOVE);
  }
  return body;
}
function scaleHaulingCreep(energy) {
  const noParts = Math.floor(energy / 150);
  let body = [];
  for (let i = 0; i < noParts; i++) {
    body.push(CARRY);
    body.push(MOVE);
  }
  return body;
}
function log(spawn) {
  const spawnObj = Game.spawns[spawn];
  const energyCap = spawnObj.room.energyCapacityAvailable;
  const currentEnergy = spawnObj.room.energyAvailable;
  const harvesters = sumRole("harvester");
  const upgraders = sumRole("upgrader");
  const builders = sumRole("builder");
  const repairers = sumRole("repairer");
  console.log(
    `\n\n\n\n\n\n\n\n\n` +
      `Spawn: ${spawn}\n` +
      `Energy: ${currentEnergy}/${energyCap}\n` +
      `Creeps:\n` +
      ` Harvesters: ${harvesters}\n` +
      ` Upgraders: ${upgraders}\n` +
      ` Builders: ${builders}\n` +
      ` Repairer: ${repairers}\n`
  );
}
function checkVacancies(spawn) {
  const spawnObj = Game.spawns[spawn];
  const room = spawnObj.room;
  const controllerObj = room.controller;
  const controllerDistance = controllerObj.pos.findPathTo(spawnObj).length;
  const sources = room.find(FIND_SOURCES);
  const containers = room.find(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_CONTAINER },
  });
  const energyCap = room.energyCapacityAvailable;
  const currentEnergy = spawnObj.room.energyAvailable;
  const harvestersPerSource = 4;
  const totalHarvesters = harvestersPerSource * sources.length;
  const upgraders = 2;
  const builders = 2;
  const repairers = 1;
  if (Memory[spawn] === undefined || sumRole("harvesester") < sources.length) {
    if (sumRole("harvester") < totalHarvesters) {
      for (let sourceName in sources) {
        const source = sources[sourceName];
        const sourceHarvesters = sumSourceHarvester(source);
        if (sourceHarvesters < 1) {
          Memory[spawn] = {
            template: emergencyHarvester(),
            memory: { role: "harvester", target: source.id, working: false },
          };
        } else if (sourceHarvesters < harvestersPerSource) {
          Memory[spawn] = {
            template: scaleBalancedCreep(energyCap),
            memory: { role: "harvester", target: source.id, working: false },
          };
        }
      }
    } else if (sumRole("upgrader") < upgraders) {
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
    } else if (sumRole("hauler") < containers.length) {
      Memory[spawm] = {
        template: scaleHaulingCreep(energyCap),
        memory: { role: "hauler", target: undefined, working: false },
      };
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
      if (Game.time % 5 === 0) {
        log(spawn);
      }
    }
  },
};
