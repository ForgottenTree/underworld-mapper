export const MODULE_TEMPLATES = {
  /*
  id = ingame names declared by developers
  name = custom name done by us
  category = outer/inner/boss
  junctions = left/bottom/right/top
  visual = entrance/boss
  visualKeyPosition = 0/0 is top left corner 100/100 is bottom right corner
  latticeNodes = array of { position: {x, y}, size: 'S'|'M'|'L' }
  */
  CornerN02: {
    id: 'CornerN02',
    name: 'River Entrance',
    category: 'outer',
    junctions: ['left', 'bottom'],
    visual: 'entrance',
    visualKeyPosition: { x: 80, y: 80 },
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'S' },
      { position: { x: 25, y: 75 }, size: 'M' },
      { position: { x: 75, y: 75 }, size: 'S' },
    ]
  },
  EndN02: {
    id: 'EndN02',
    name: 'Disability Entrance',
    category: 'outer',
    junctions: ['bottom'],
    visual: 'entrance',
    visualKeyPosition: { x: 50, y: 50 },
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'S' },
      { position: { x: 25, y: 75 }, size: 'M' },
      { position: { x: 75, y: 75 }, size: 'S' },
      { position: { x: 50, y: 25 }, size: 'S' },
    ]
  },
  EntranceN01: {
    id: 'EntranceN01',
    name: 'Mountain Entrance',
    category: 'outer',
    junctions: ['bottom'],
    visual: 'entrance',
    visualKeyPosition: { x: 50, y: 50 },
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'S' },
      { position: { x: 25, y: 75 }, size: 'M' },
      { position: { x: 75, y: 75 }, size: 'S' },
      { position: { x: 50, y: 25 }, size: 'S' },
    ]
  },
  StraightN01: {
    id: 'StraightN01',
    name: 'Middle Entrance',
    category: 'outer',
    junctions: ['bottom', 'top'],
    visual: 'entrance',
    visualKeyPosition: { x: 50, y: 50 },
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'S' },
      { position: { x: 25, y: 75 }, size: 'M' },
      { position: { x: 75, y: 75 }, size: 'L' },
      { position: { x: 50, y: 25 }, size: 'S' },
    ]
  },
  BranchN01: {
    id: 'BranchN01',
    name: 'Ashpot Cave',
    category: 'inner',
    junctions: ['left', 'right', 'bottom'],
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'L' },
      { position: { x: 25, y: 75 }, size: 'M' },
      { position: { x: 75, y: 75 }, size: 'L' },
      { position: { x: 50, y: 25 }, size: 'S' },
    ]
  },
  CornerN01: {
    id: 'CornerN01',
    name: 'Blocked Corridor',
    category: 'inner',
    junctions: ['left', 'bottom'],
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'S' },
      { position: { x: 25, y: 75 }, size: 'S' },
      { position: { x: 75, y: 75 }, size: 'S' },
    ]
  },
  CrossN01: {
    id: 'CrossN01',
    name: 'Stone Throne',
    category: 'inner',
    junctions: ['left', 'right', 'bottom', 'top'],
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'S' },
      { position: { x: 25, y: 75 }, size: 'S' },
      { position: { x: 75, y: 75 }, size: 'S' },
      { position: { x: 50, y: 25 }, size: 'S' },
    ]
  },
  EndN01: {
    id: 'EndN01',
    name: 'Dead End Ravine',
    category: 'inner',
    junctions: ['bottom'],
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'S' },
      { position: { x: 25, y: 75 }, size: 'S' },
      { position: { x: 75, y: 75 }, size: 'M' },
      { position: { x: 50, y: 25 }, size: 'S' },
    ]
  },
  StraightN02: {
    id: 'StraightN02',
    name: 'Womb Cave',
    category: 'inner',
    junctions: ['bottom', 'top'],
    latticeNodes: [
      { position: { x: 25, y: 25 }, size: 'S' },
      { position: { x: 75, y: 25 }, size: 'L' },
      { position: { x: 25, y: 75 }, size: 'M' },
      { position: { x: 75, y: 75 }, size: 'L' },
      { position: { x: 50, y: 25 }, size: 'S' },
    ]
  },
  EndNBoss01: {
    id: 'EndNBoss01',
    name: 'Dead End Bossroom',
    category: 'boss',
    junctions: ['bottom'],
    visual: 'boss',
    visualKeyPosition: { x: 50, y: 50 },
    latticeNodes: []
  },
  StraightNBoss01: {
    id: 'StraightNBoss01',
    name: 'Passthrough Bossroom',
    category: 'boss',
    junctions: ['bottom', 'top'],
    visual: 'boss',
    visualKeyPosition: { x: 50, y: 50 },
    latticeNodes: []
  }
};

export const CATEGORY_META = {
  outer: {
    label: 'Outer Modules',
    modalTitle: 'Outer Entries',
    cardTheme: 'bg-tactical-panel border-emerald-500/50 text-emerald-300',
    sidebarBorder: 'border-l-emerald-500/50',
    modalHighlight: 'border-emerald-500/30',
    borderClass: 'border-emerald-500/50',
  },
  inner: {
    label: 'Inner Modules',
    modalTitle: 'Inner Paths',
    cardTheme: 'bg-tactical-panel border-indigo-500/50 text-indigo-300',
    sidebarBorder: 'border-l-indigo-500/50',
    modalHighlight: 'border-indigo-500/30',
    borderClass: 'border-indigo-500/50',
  },
  boss: {
    label: 'Boss Modules',
    modalTitle: 'Boss Lairs',
    cardTheme: 'bg-tactical-panel border-rose-500/50 text-rose-300',
    sidebarBorder: 'border-l-rose-500/50',
    modalHighlight: 'border-rose-500/30',
    borderClass: 'border-rose-500/50',
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

export const getTemplateLabel = (tmpl, showId) => tmpl[showId ? 'id' : 'name'];