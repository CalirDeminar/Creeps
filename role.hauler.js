function getStructureToStore(creep) {
  // neaten and rename
  const spawnStructures = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => {
      if ([STRUCTURE_SPAWN, STRUCTURE_EXTENSION].includes(s.structureType)) {
        switch (s.structureType) {
          case STRUCTURE_SPAWN:
          case STRUCTURE_EXTENSION:
            return (
              [STRUCTURE_SPAWN, STRUCTURE_EXTENSION].includes(
                s.structureType
              ) && s.energy < s.energyCapacity
            );
          case STRUCTURE_CONTAINER:
            return s.store.energy < 5000;
        }
      } else {
        return false;
      }
    },
  });
  if (spawnStructures) {
    return spawnStructures;
  } else {
    return creep.room.storage;
  }
  return output;
}
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
      const container = Game.getObjectById(creep.memory.target);
      const resp = creep.withdraw(container, RESOURCE_ENERGY);
      if (resp == ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else {
      const targetStore = getStructureToStore(creep);
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
