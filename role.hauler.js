const { getStructureToStore2 } = require("creepUtil");
module.exports = {
  run: function (creep) {
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

    if (!creep.memory.working) {
      const container = creep.room
        .find(FIND_STRUCTURES, {
          filter: (s) => s.structureType === STRUCTURE_CONTAINER,
        })
        .sort((a, b) => b.store.energy - a.store.energy)[0];
      const resp = creep.withdraw(container, RESOURCE_ENERGY);
      if (resp == ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else {
      const targetStore = getStructureToStore2(creep);
      const resp = creep.transfer(targetStore, RESOURCE_ENERGY);
      if (resp === ERR_NOT_IN_RANGE) {
        // not in range, move closer
        creep.moveTo(targetStore, {
          visualizePathStyle: { stroke: "#ffaa00" },
        });
      }
    }
  },
};
