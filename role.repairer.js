const { getStructureToHarvest, dropRoad } = require("creepUtil");
const builder = require("role.builder");
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
      const structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          s.hits < s.hitsMax &&
          s.structureType != STRUCTURE_WALL &&
          s.structureType != STRUCTURE_RAMPART,
      });
      const tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          s.structureType == STRUCTURE_TOWER && s.energy / s.energyCapacity < 1,
      });
      if (tower) {
        if (creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(tower, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      } else if (structure) {
        if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
          creep.moveTo(structure, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        }
      } else {
        builder.run(creep);
      }
    } else if (Memory.Spawn1 === undefined) {
      // find source of energy
      const target = getStructureToHarvest(creep);
      const withdrawResult = creep.withdraw(target, RESOURCE_ENERGY);
      if (withdrawResult == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  },
};
