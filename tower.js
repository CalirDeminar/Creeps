module.exports = {
  run: function (tower) {
    const target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (target !== undefined) {
      tower.attack(target);
    } else {
      const percentEnergy = tower.energy / tower.energyCapacity;
      if (percentEnergy > 0.5) {
        const healTargets = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
          filter: (s) =>
            s.structureType == STRUCTURE_WALL ||
            s.structureType == STRUCTURE_RAMPART,
        });
        const healTarget = healTargets.sort((a, b) => a.hits - b.hits)[0];
        if (healTarget) {
          target.heal(healTarget);
        }
      }
    }
  },
};
