const storage = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
module.exports = {
  getStructureToStore1: function (creep) {
    const closeContainer = creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER },
    });
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
              return s.store.energy < 5000;
          }
        } else {
          return false;
        }
      },
    });
    return output;
  },
  getStructureToStore2: function (creep) {
    // neaten and rename
    const closeContainer = creep.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: { structureType: STRUCTURE_CONTAINER },
    });
    const output = creep.pos.findClosestByPath(FIND_STRUCTURES, {
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
    return output;
  },
  getStructureToStore: function (creep) {
    if (Memory.toStore) {
      const output = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          storage.includes(s.structureType) &&
          s.energy < s.energyCapacity &&
          !Memory.toStore.includes(s.id),
      });
      if (output) {
        creep.memory.storeTarget = output.id;
        if (output.structureType != STRUCTURE_SPAWN) {
          Memory.toStore.push(output.id);
        }
      }
      return output;
    } else {
      Memory.toStore = [];
      return this.getStructureToStore(creep);
    }
  },
  getStructureToHarvest: function (creep) {
    if (Memory.toStore)
      return creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) =>
          s.energy > 5 &&
          Memory.Spawn1 === undefined &&
          (s.structureType === STRUCTURE_SPAWN ||
            s.structureType === STRUCTURE_EXTENSION),
      });
  },
  dropRoad: function (creep) {
    //if (
    //  creep.room.find(FIND_CONSTRUCTION_SITES).length < 4 &&
    //  creep.room.controller.level > 3
    //) {
    //  creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
    // }
  },
  getNearbyContainer: function (creep) {
    return creep.pos.findInRange(FIND_STRUCTURES, 2, {
      filter: function (s) {
        return (
          s.structureTYPE === STRUCTURE_CONTAINER && s.store < s.storeCapacity
        );
      },
    })[0];
  },
  getConstructionSite: function (creep) {
    const sites = creep.room
      .find(FIND_CONSTRUCTION_SITES)
      .sort(
        (a, b) => a.progressTotal - a.progress - (b.progressTotal - b.progress)
      );
    return sites[0];
  },
};
