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
}
module.exports = {
  buildExtensions: function () {
    const baseX = Game.spawns.Spawn1.pos.x;
    const baseY = Game.spawns.Spawn1.pos.y;
    const gap = 4;
    const room = Game.spawns.Spawn1.room;
    let currentExtensions =
      room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_EXTENSION,
      }).length + 1;
    let size = getSize(currentExtensions);
    let x = size * -1;
    let y = size * -1;
    while (x <= size) {
      while (y <= size) {
        if (x === size || y === size || x === size * -1 || y === size * -1) {
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
    if (room.controller.level >= 2) {
    }
  },
};

// -2 -2
// -2  2
//  2 -2
//  2  2

// -4 -4
// -4  0
//  0 -4
//  4  0
//  0  4
//  4  4

// 4 + 4 + 2 + 2

// 0  1  2
// 3  -  4
// 5  6  7

// (1-3) -> 2
// (4-)
//
