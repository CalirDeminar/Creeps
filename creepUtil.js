const storage = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
module.exports = {
  getStructureToStore: function (creep) {
    const output = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) =>
        storage.includes(s.structureType) &&
        s.energy < s.energyCapacity &&
        !Memory.toStore.includes(s.id),
    });
    if (output) {
      return output;
    } else {
      return creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_STORAGE,
      });
    }
  },
  getStructureToHarvest: function (creep) {
    const storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (s) =>
        s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 5,
    });
    if (storage) {
      return storage;
    } else {
      return creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          s.energy > 5 &&
          Memory.Spawn1 === undefined &&
          (s.structureType === STRUCTURE_SPAWN ||
            s.structureType === STRUCTURE_EXTENSION),
      });
    }
  },
  dropRoad: function (creep) {
    const terrain = creep.room.lookForAt(
      "terrain",
      creep.pos.x,
      creep.pos.y
    )[0];
    const towers = creep.room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER,
    })[0];
    if (terrain !== "plain") {
    }
    if (
      creep.room.find(FIND_CONSTRUCTION_SITES).length < 4 &&
      ((terrain === "swamp" && creep.room.controller.level >= 2) ||
        creep.room.controller.level >= 4)
    ) {
      creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
    }
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
