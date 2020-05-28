const { getStructureToStore1, dropRoad } = require("creepUtil");
const pathColour = "#ff9700";
module.exports = {
  run: function (creep) {
    dropRoad(creep);
    if (!creep.memory.working && creep.carry.energy == 0) {
      // if empty, set to work
      const index = Memory.toStore.filter(
        (e) => e === creep.memory.storeTarget
      );
      const newToStore = Memory.toStore.splice(index, 1);
      Memory.toStore = newToStore;
      creep.memory.storeTarget = undefined;
      creep.memory.working = true;
    } else if (
      creep.memory.working &&
      creep.carry.energy === creep.carryCapacity
    ) {
      // if working and full, stop working
      creep.memory.working = false;
    }
    if (creep.memory.working) {
      // if working, harvest source. If not in range, move into range
      const source = creep.memory.target
        ? Game.getObjectById(creep.memory.target)
        : creep.pos.findClosestByPath(FIND_SOURCES);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source, { visualizePathStyle: { stroke: pathColour } });
      }
    } else {
      // if not working, transfer to spawn. If not in range, move into range
      // getting creep target every tick
      const targetStore = getStructureToStore1(creep);
      // if target is known
      const transferResult = creep.transfer(targetStore, RESOURCE_ENERGY);
      // attempt transfer
      if (transferResult === ERR_NOT_IN_RANGE) {
        // not in range, move closer
        creep.moveTo(targetStore, {
          visualizePathStyle: { stroke: pathColour },
        });
      }
    }
  },
};
