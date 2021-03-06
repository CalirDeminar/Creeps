const { dropRoad } = require("creepUtil");
const pathColour = "orange";
function getStructureToStore(creep) {
  dropRoad(creep);
  const storage = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
  const output = creep.pos.findClosestByPath(FIND_STRUCTURES, {
    filter: (s) => {
      if (storage.includes(s.structureType)) {
        switch (s.structureType) {
          case STRUCTURE_SPAWN:
          case STRUCTURE_EXTENSION:
            return (
              storage.includes(s.structureType) && s.energy < s.energyCapacity
            );
          case STRUCTURE_CONTAINER:
            return s.store[RESOURCE_ENERGY] < 2000;
        }
      } else {
        return false;
      }
    },
  });
  return output;
}
module.exports = {
  run: function (creep) {
    if (
      (!creep.memory.working && creep.carry.energy == 0) ||
      creep.carryCapacity === 0
    ) {
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
      const source = Game.getObjectById(creep.memory.targetSource);
      // if in target room
      if (creep.pos.roomName === creep.memory.targetRoom) {
        if (creep.harvest(source) !== 0) {
          const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER,
          })[0];
          creep.moveTo(container || source, {
            visualizePathStyle: { stroke: pathColour },
          });
        }
      } else {
        // find exit to target room
        const exit = creep.room.findExitTo(creep.memory.targetRoom);
        creep.moveTo(creep.pos.findClosestByPath(exit), {
          visualizePathStyle: { stroke: pathColour },
        });
      }
    } else {
      // if not working, transfer to spawn. If not in range, move into range
      // getting creep target every tick
      const targetStore = getStructureToStore(creep);
      if (creep.pos.roomName === creep.memory.home) {
        // if target is known
        const transferResult = creep.transfer(targetStore, RESOURCE_ENERGY);
        // attempt transfer
        if (transferResult === ERR_NOT_IN_RANGE) {
          // not in range, move closer
          creep.moveTo(targetStore, {
            visualizePathStyle: { stroke: pathColour },
          });
        }
      } else {
        // find exit towards home room
        const exit = creep.room.findExitTo(creep.memory.home);
        creep.moveTo(creep.pos.findClosestByPath(exit), {
          visualizePathStyle: { stroke: pathColour },
        });
      }
    }
  },
};
// DROP constructionSite for Container When Mining
