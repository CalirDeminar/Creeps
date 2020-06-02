module.exports = {
  run: function (creep) {
    if (Memory.remotes !== undefined) {
      const key = _.filter(Object.keys(Game.flags), (f) =>
        f.includes("explore")
      )[0];
      if (key) {
        const flag = Game.flags[key];
        if (flag.pos.roomName !== creep.pos.roomName) {
          const exit = creep.room.findExitTo(flag.pos.roomName);
          creep.moveTo(creep.pos.findClosestByPath(exit));
        } else {
          const room = creep.room;
          const sources = room.find(FIND_SOURCES);
          for (sourceName in sources) {
            console.log(sourceName);
            Memory.remotes.push({
              sourceId: sources[sourceName].id,
              roomName: sources[sourceName].pos.roomName,
            });
          }
          flag.remove();
        }
      }
    } else {
      Memory.remotes = [];
    }
  },
};
