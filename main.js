const harvester = require("role.harvester");
const upgrader = require("role.upgrader");
const builder = require("role.builder");
const repairer = require("role.repairer");
const hauler = require("role.hauler");
const towerR = require("tower");
const staffManager = require("staffManager");
module.exports.loop = function () {
  // Memory Clear
  for (let name in Memory.creeps) {
    if (Game.creeps[name] == undefined) {
      delete Memory.creeps[name];
    }
  }
  if (typeof Memory.toStore != "object") {
    Memory.toStore = [];
  }

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    switch (creep.memory.role) {
      case "harvester":
        harvester.run(creep);
        break;
      case "upgrader":
        upgrader.run(creep);
        break;
      case "builder":
        builder.run(creep);
        break;
      case "repairer":
        repairer.run(creep);
        break;
      case "hauler":
        hauler.run(creep);
    }
  }
  const towers = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
    filter: (s) => s.structureType == STRUCTURE_TOWER,
  });
  for (let tower of towers) {
    towerR.run(tower);
  }
  staffManager.run();
};

// starting phases
// needs basic miners to set up to lvl 2
// at lvl 2, transition to box mining?
// scale creep size based on no. extensions?
