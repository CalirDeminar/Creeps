const sourceManager = require("sourceManager");
const constructionManager = require("constructionManager");
function sumRole(role) {
  return _.sum(Game.creeps, (c) => c.memory.role === role);
}
function log(room) {
  const energyCap = room.energyCapacityAvailable;
  const energyBudget = getEnergyBudget(room);
  const currentEnergy = room.energyAvailable;
  const harvesters = sumRole("harvester");
  const upgraders = sumRole("upgrader");
  const builders = sumRole("builder");
  const repairers = sumRole("repairer");
  const haulers = sumRole("hauler");
  let creepCost = 0;
  for (let creepName in Game.creeps) {
    const body = Game.creeps[creepName].body;
    creepCost = body.reduce((acc, part) => {
      switch (part) {
        case "work":
          return acc + 100;
        default:
          return acc + 50;
      }
    }, creepCost);
  }
  const upkeepCost = Math.ceil(creepCost / 1500);
  console.log(
    `\n\n\n\n\n\n\n\n\n` +
      `Room: ${room.name}\n` +
      `Energy: ${currentEnergy}/${energyCap}\n` +
      `Energy Budget: ${energyBudget} /t\n` +
      `Creeps:\n` +
      ` Upkeep: ${upkeepCost} /t\n` +
      ` Harvesters: ${harvesters}\n` +
      ` Upgraders: ${upgraders}\n` +
      ` Builders: ${builders}\n` +
      ` Repairer: ${repairers}\n` +
      ` Hauler: ${haulers}\n` +
      `\n\n ${Game.time}`
  );
}
function memorySetup(room) {
  // room field
  // -> buildQueue (TODO order harvester -> hauler -> builder -> upgrader -> repaier)
  if (!Object.keys(Memory).includes(room.name)) {
    console.log("Blanking Room");
    Memory[room.name] = { buildQueue: [], baseTile: Game.spawns.Spawn1.pos };
  }
}
function getEnergyBudget(room) {
  let budget = 0;
  const sources = room.find(FIND_SOURCES);
  for (let sourceName in sources) {
    budget = budget + sources[sourceName].energyCapacity / 300;
  }
  return budget;
}
module.exports = {
  run(room) {
    const rcl = room.controller.level;
    memorySetup(room);
    constructionManager.buildLevelLimitedStructures(room);
    const sources = room.find(FIND_SOURCES);
    for (let sourceName in sources) {
      sourceManager.harvesterSetup(sources[sourceName]);
    }
    if (Game.time % 5 === 0) {
      log(room);
    }
  },
};
