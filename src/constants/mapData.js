export const MODULE_TEMPLATES = {
  CornerN02: { id: 'CornerN02', name: 'Corner N02', category: 'outer', junctions: ['left', 'bottom'], visual: 'entrance' },
  EndN02: { id: 'EndN02', name: 'End N02', category: 'outer', junctions: ['bottom'], visual: 'entrance' },
  EntranceN01: { id: 'EntranceN01', name: 'Entrance N01', category: 'outer', junctions: ['bottom'], visual: 'entrance' },
  StraightN01: { id: 'StraightN01', name: 'Straight N01', category: 'outer', junctions: ['bottom', 'top'], visual: 'entrance' },
  BranchN01: { id: 'BranchN01', name: 'Branch N01', category: 'inner', junctions: ['left', 'right', 'bottom'] },
  CornerN01: { id: 'CornerN01', name: 'Corner N01', category: 'inner', junctions: ['left', 'bottom'] },
  CrossN01: { id: 'CrossN01', name: 'Cross N01', category: 'inner', junctions: ['left', 'right', 'bottom', 'top'] },
  EndN01: { id: 'EndN01', name: 'End N01', category: 'inner', junctions: ['bottom'] },
  StraightN02: { id: 'StraightN02', name: 'Straight N02', category: 'inner', junctions: ['bottom', 'top'] },
  EndNBoss01: { id: 'EndNBoss01', name: 'End NBoss 01', category: 'boss', junctions: ['bottom'], visual: 'boss' },
  StraightNBoss01: { id: 'StraightNBoss01', name: 'Straight NBoss 01', category: 'boss', junctions: ['bottom', 'top'], visual: 'boss' }
};

export const DIRECTION_OFFSETS = {
  top: { x: 0, y: -1, opposite: 'bottom' },
  bottom: { x: 0, y: 1, opposite: 'top' },
  left: { x: -1, y: 0, opposite: 'right' },
  right: { x: 1, y: 0, opposite: 'left' }
};

export const ROTATIONS = [0, 90, 180, 270];
export const CELL_SIZE = 160; // Size of each module square on the grid in pixels