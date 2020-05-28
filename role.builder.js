const {
  getStructureToHarvest,
  getConstructionSite,
  dropRoad,
} = require("creepUtil");
const upgrader = require("role.upgrader");
const pathColour = "#005eff"; // blue
module.exports = {
  run: function (creep) {
    dropRoad(creep);
    if (creep.memory.working && creep.carry.energy === 0) {
      // if carry energy to controller AND empty
      creep.memory.working = false;
    } else if (
      !creep.memory.working &&
      creep.carry.energy == creep.carryCapacity
    ) {
      // if harvesting but full
      creep.memory.working = true;
    }

    if (creep.memory.working) {
      const constructionSite = getConstructionSite(creep);
      if (constructionSite != undefined) {
        // if construction site available, do that
        if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
          // build construction, if out of range, move into range
          creep.moveTo(constructionSite, {
            visualizePathStyle: { stroke: pathColour },
          });
        }
      }
      // try to upgrade controller
      else {
        upgrader.run(creep);
      }
    } else if (Memory.Spawn1 === undefined) {
      // find source of energy
      const target = getStructureToHarvest(creep);
      if (target !== undefined) {
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { visualizePathStyle: { stroke: pathColour } });
        }
      } else {
        creep.target = getStructureToHarvest(creep);
      }
    }
  },
};
