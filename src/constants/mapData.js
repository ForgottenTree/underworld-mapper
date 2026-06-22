export const MODULE_TEMPLATES = {
  CornerN02: { id: 'CornerN02', name: 'River Entrance', category: 'outer', junctions: ['left', 'bottom'], visual: 'entrance' },
  EndN02: { id: 'EndN02', name: 'Disability Entrance', category: 'outer', junctions: ['bottom'], visual: 'entrance' },
  EntranceN01: { id: 'EntranceN01', name: 'Mountain Entrance', category: 'outer', junctions: ['bottom'], visual: 'entrance' },
  StraightN01: { id: 'StraightN01', name: 'Middle Entrance', category: 'outer', junctions: ['bottom', 'top'], visual: 'entrance' },
  BranchN01: { id: 'BranchN01', name: 'Ashpot Cave', category: 'inner', junctions: ['left', 'right', 'bottom'] },
  CornerN01: { id: 'CornerN01', name: 'Blocked Corridor', category: 'inner', junctions: ['left', 'bottom'] },
  CrossN01: { id: 'CrossN01', name: 'Stone Throne', category: 'inner', junctions: ['left', 'right', 'bottom', 'top'] },
  EndN01: { id: 'EndN01', name: 'Dead End Ravine', category: 'inner', junctions: ['bottom'] },
  StraightN02: { id: 'StraightN02', name: 'Womb Cave', category: 'inner', junctions: ['bottom', 'top'] },
  EndNBoss01: { id: 'EndNBoss01', name: 'Dead End Bossroom', category: 'boss', junctions: ['bottom'], visual: 'boss' },
  StraightNBoss01: { id: 'StraightNBoss01', name: 'Passthrough Bossroom', category: 'boss', junctions: ['bottom', 'top'], visual: 'boss' }
};

export const CATEGORY_META = {
  outer: {
    label: 'Outer Modules',
    modalTitle: 'Outer Entries',
    cardTheme: 'bg-tactical-panel border-emerald-500/50 text-emerald-300',
    sidebarBorder: 'border-l-emerald-500/50',
    modalHighlight: 'border-emerald-500/30',
  },
  inner: {
    label: 'Inner Modules',
    modalTitle: 'Inner Paths',
    cardTheme: 'bg-tactical-panel border-indigo-500/50 text-indigo-300',
    sidebarBorder: 'border-l-indigo-500/50',
    modalHighlight: 'border-indigo-500/30',
  },
  boss: {
    label: 'Boss Modules',
    modalTitle: 'Boss Lairs',
    cardTheme: 'bg-tactical-panel border-rose-500/50 text-rose-300',
    sidebarBorder: 'border-l-rose-500/50',
    modalHighlight: 'border-rose-500/30',
  },
};

export const DIRECTION_OFFSETS = {
  top: { x: 0, y: -1, opposite: 'bottom' },
  bottom: { x: 0, y: 1, opposite: 'top' },
  left: { x: -1, y: 0, opposite: 'right' },
  right: { x: 1, y: 0, opposite: 'left' }
};

export const ROTATIONS = [0, 90, 180, 270];
export const CELL_SIZE = 160; // Size of each module square on the grid in pixels