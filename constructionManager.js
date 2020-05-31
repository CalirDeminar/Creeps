const maxExtensions = [0, 0, 5, 10, 20, 30, 40, 50, 60];
function getSize(extensions) {
  if (extensions < 4) {
    return 2;
  } else if (extensions < 6 + 4) {
    return 4;
  } else if (extensions < 12 + 6 + 4) {
    return 6;
  } else {
    return 8;
  }
  // 4, 10, 22
}
module.exports = {
  buildExtensions: function (room) {
    const spawn = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_SPAWN,
    })[0];
    const baseX = spawn.pos.x;
    const baseY = spawn.pos.y;
    const gap = 4;
    const rcl = room.controller.level;
    let currentExtensions = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_EXTENSION,
    }).length;
    const currentExtensionSites = room.find(FIND_CONSTRUCTION_SITES, {
      filter: (s) => s.structureType === STRUCTURE_EXTENSION,
    }).length;
    let size = getSize(currentExtensions);
    let x = size * -1;
    let y = size * -1;
    while (x <= size) {
      while (y <= size) {
        if (
          (x === size || y === size || x === size * -1 || y === size * -1) &&
          currentExtensions + currentExtensionSites < maxExtensions[rcl]
        ) {
          // build shit here
          room.createConstructionSite(
            new RoomPosition(baseX + x, baseY + y, room.name),
            STRUCTURE_EXTENSION
          );
        }
        y = y + gap;
      }
      y = size * -1;
      x = x + gap;
    }
  },
  buildContainers: function (room) {
    const sources = room.find(FIND_SOURCES);
    const energyCap = room.energyCapacityAvailable;
    for (let sourceName in sources) {
      const source = sources[sourceName];
      const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER,
      });
      const containerSites = source.pos.findInRange(
        FIND_CONSTRUCTION_SITES,
        1,
        {
          filter: (s) => s.structureType === STRUCTURE_CONTAINER,
        }
      );
      if (source.room.controller.level >= 2) {
        if (containers.length === 0 && containerSites.length === 0) {
          console.log("Building Containers");
          // build container
          const creepInRange = source.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.memory.role === "harvester",
          })[0];
          if (creepInRange) {
            source.room.createConstructionSite(
              creepInRange.pos,
              STRUCTURE_CONTAINER
            );
          }
        }
      }
    }
  },
  buildTower: function (room) {
    const spawn = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_SPAWN,
    })[0];
    let spawnPos = spawn.pos;
    spawnPos.x = spawnPos.x + 1;
    const towers = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_TOWER,
    });
    if (room.controller.level >= 3 && towers.length === 0) {
      room.createConstructionSite(spawnPos, STRUCTURE_TOWER);
    }
  },
  buildLevelLimitedStructures: function (room) {
    // todo fix this assignment
    const rcl = room.controller.level;
    this.buildExtensions(room);
    if (rcl >= 2) {
      this.buildContainers(room);
    }
    if (rcl >= 3) {
      this.buildTower(room);
    }
  },
};

// All these need to handle structures being in way of building site
