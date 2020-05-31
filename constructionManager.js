const maxExtensions = [0, 0, 5, 10, 20, 30, 40, 50, 60];
const tileWidth = 4;
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
    const rcl = room.controller.level;
    const nextTiles = this.getAdjacentTile(spawn.pos, 1);
    const clearTiles = _.filter(nextTiles, (t) => this.tileIsClear(t));
    const tilesNeeded = Math.ceil(maxExtensions[rcl] / 5);
    for (let i = 0; i < tilesNeeded; i++) {
      this.buildStructures(clearTiles[i]);
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
    if (towers.length === 0) {
      room.createConstructionSite(spawnPos, STRUCTURE_TOWER);
    }
  },
  buildStorage: function (room) {
    const spawn = room.find(FIND_MY_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_SPAWN,
    })[0];
    let spawnPos = spawn.pos;
    spawnPos.x = spawnPos.x - 1;
    const storage = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_STORAGE,
    });
    if (storage.length === 0) {
      room.createConstructionSite(spawnPos, STRUCTURE_STORAGE);
    }
  },
  getAdjacentTile: function (pos, depth) {
    const above = {
      x: pos.x,
      y: pos.y + depth * tileWidth,
      roomName: pos.roomName,
    };
    const below = {
      x: pos.x,
      y: pos.y - depth * tileWidth,
      roomName: pos.roomName,
    };
    const left = {
      x: pos.x - depth * tileWidth,
      y: pos.y,
      roomName: pos.roomName,
    };
    const right = {
      x: pos.x + depth * tileWidth,
      y: pos.y,
      roomName: pos.roomName,
    };
    return [left, below, right, above];
  },
  tileIsClear: function (pos) {
    const terrain = Game.map.getRoomTerrain(pos.roomName);
    let output = true;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        output =
          output && terrain.get(pos.x + x, pos.y + y) !== TERRAIN_MASK_WALL;
      }
    }
    return output;
  },
  buildStructures: function (pos) {
    const room = Game.rooms[pos.roomName];
    const rcl = room.controller.level;
    const radius = Math.floor(tileWidth / 2);
    let currentExtensions = room.find(FIND_STRUCTURES, {
      filter: (s) => s.structureType === STRUCTURE_EXTENSION,
    }).length;
    const currentExtensionSites = room.find(FIND_CONSTRUCTION_SITES, {
      filter: (s) => s.structureType === STRUCTURE_EXTENSION,
    }).length;
    const totalExtensions = currentExtensions + currentExtensionSites;
    for (let x = radius * -1; x <= radius; x++) {
      for (let y = radius * -1; y <= radius; y++) {
        if (Math.abs(x) + Math.abs(y) === radius) {
          room.createConstructionSite(
            new RoomPosition(pos.x + x, pos.y + y, pos.roomName),
            STRUCTURE_ROAD
          );
        }
        if ((x === 0 && y === 0) || Math.abs(x) + Math.abs(y) === radius - 1) {
          if (totalExtensions < maxExtensions[rcl]) {
            room.createConstructionSite(
              new RoomPosition(pos.x + x, pos.y + y, room.name),
              STRUCTURE_EXTENSION
            );
          }
        }
      }
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
    if (rcl >= 4) {
      this.buildStorage(room);
    }
  },
};

// All these need to handle structures being in way of building site

//        R R E E E R R
//      R E R R E R R E
//    R E E E R S R E E
//      R E R R E R R E
//       R  R E E E R R

//          R    |  R
//        R TmR  |R E R
//      R T S T R|E E E R
//        R StR  |R E R
//          R    |  R

//      E
//    E2  E2
//  E   S   E
//    E2  E2
//      E
