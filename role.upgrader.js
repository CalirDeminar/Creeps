const { getStructureToHarvest, dropRoad } = require("creepUtil");
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
      if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
        // if out of range of controller, move to controller
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: { stroke: "#ffaa00" },
        });
      }
    } else if (Memory.Spawn1 === undefined) {
      // find source of energy
      // getting creep target every tick
      const target = getStructureToHarvest(creep);
      const withdrawResult = creep.withdraw(target, RESOURCE_ENERGY);
      if (withdrawResult == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (withdrawResult !== 0) {
        creep.memory.target = undefined;
      }
    }
  },
};
