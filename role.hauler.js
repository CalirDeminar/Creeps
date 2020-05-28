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

    if (creep.memory.target === undefined) {
      const containers = creep.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_CONTAINER },
      });
      const occupied = [];
      for (let creepName in Game.creeps) {
        const c = Game.creeps[creepName];
        if (c.role === "hauler" && c.target != undefined) {
          occupied.push(c.target);
        }
      }
      creep.memory.target = containers.filter((c) =>
        occupied.includes(c.id)
      )[0];
    } else if (creep.memory.working) {
      const target = Game.getObjectById(creep.memory.target);
      const resp = creep.withdraw(target, RESOURCE_ENERGY);
      if (resp == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
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
