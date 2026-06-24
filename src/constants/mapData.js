export const MODULE_TEMPLATES = {
  /*
  id = ingame names declared by developers
  name = custom name done by us
  category = outer/inner/boss
  junctions = left/bottom/right/top
  position: 0/0 is top left corner 100/100 is bottom right corner
  visualKeys = array for visual items
    { icon: typeOfItem, position: {x, y} }
    possible items: entrance, rareMetal      
  latticeNodes = array for the mine-able cubes
    { position: {x, y}, size: 'S'|'M'|'L' }
  */
  CornerN02: {
    id: 'CornerN02',
    name: 'River Entrance',
    category: 'outer',
    junctions: ['left', 'bottom'],
    visualKeys: [{ icon: 'entrance', position: { x: 75, y: 63 } }],
    latticeNodes: [
      { position: { x: 10, y: 44 }, size: 'S' },
      { position: { x: 74, y: 43 }, size: 'M' },
      { position: { x: 67, y: 13 }, size: 'S' },
      { position: { x: 38, y: 75 }, size: 'S' },
    ]
  },
  EndN02: {
    id: 'EndN02',
    name: 'Disability Entrance',
    category: 'outer',
    junctions: ['bottom'],
    visualKeys: [{ icon: 'entrance', position: { x: 70, y: 25 } }],
    latticeNodes: [
      { position: { x: 27, y: 21 }, size: 'S' },
      { position: { x: 42, y: 69 }, size: 'S' },
      { position: { x: 25, y: 79 }, size: 'M' },
      { position: { x: 71, y: 75 }, size: 'S' },
      { position: { x: 37, y: 41 }, size: 'S' },
    ]
  },
  EntranceN01: {
    id: 'EntranceN01',
    name: 'Mountain Entrance',
    category: 'outer',
    junctions: ['bottom'],
    visualKeys: [{ icon: 'entrance', position: { x: 84, y: 60 } }],
    latticeNodes: [
      { position: { x: 28, y: 21 }, size: 'S' },
      { position: { x: 89, y: 37 }, size: 'S' },
      { position: { x: 34, y: 70 }, size: 'M' },
      { position: { x: 17, y: 56 }, size: 'S' },
      { position: { x: 57, y: 9 }, size: 'S' },
    ]
  },
  StraightN01: {
    id: 'StraightN01',
    name: 'Middle Entrance',
    category: 'outer',
    junctions: ['bottom', 'top'],
    visualKeys: [{ icon: 'entrance', position: { x: 50, y: 52 } }],
    latticeNodes: [
      { position: { x: 28, y: 22 }, size: 'S' },
      { position: { x: 82, y: 33 }, size: 'M' },
      { position: { x: 33, y: 65 }, size: 'S' },
      { position: { x: 74, y: 74 }, size: 'L' },
      { position: { x: 81, y: 10 }, size: 'S' },
    ]
  },
  BranchN01: {
    id: 'BranchN01',
    name: 'Ashpot Cave',
    category: 'inner',
    junctions: ['left', 'right', 'bottom'],
    visualKeys: [],
    latticeNodes: [
      { position: { x: 23, y: 20 }, size: 'M' },
      { position: { x: 75, y: 29 }, size: 'S' },
      { position: { x: 15, y: 70 }, size: 'L' },
      { position: { x: 61, y: 90 }, size: 'S' },
      { position: { x: 50, y: 60 }, size: 'L' },
    ]
  },
  CornerN01: {
    id: 'CornerN01',
    name: 'Blocked Corridor',
    category: 'inner',
    junctions: ['left', 'bottom'],
    visualKeys: [],
    latticeNodes: [
      { position: { x: 21, y: 33 }, size: 'S' },
      { position: { x: 35, y: 50 }, size: 'S' },
      { position: { x: 20, y: 81 }, size: 'S' },
      { position: { x: 48, y: 58 }, size: 'S' },
    ]
  },
  CrossN01: {
    id: 'CrossN01',
    name: 'Stone Throne',
    category: 'inner',
    junctions: ['left', 'right', 'bottom', 'top'],
    visualKeys: [],
    latticeNodes: [
      { position: { x: 15, y: 35 }, size: 'S' },
      { position: { x: 70, y: 30 }, size: 'S' },
      { position: { x: 19, y: 60 }, size: 'S' },
      { position: { x: 79, y: 68 }, size: 'S' },
      { position: { x: 41, y: 46 }, size: 'S' },
    ]
  },
  EndN01: {
    id: 'EndN01',
    name: 'Dead End Ravine',
    category: 'inner',
    junctions: ['bottom'],
    visualKeys: [],
    latticeNodes: [
      { position: { x: 85, y: 76 }, size: 'S' },
      { position: { x: 33, y: 85 }, size: 'M' },
      { position: { x: 69, y: 85 }, size: 'S' },
      { position: { x: 14, y: 78 }, size: 'S' },
      { position: { x: 53, y: 62 }, size: 'S' },
    ]
  },
  StraightN02: {
    id: 'StraightN02',
    name: 'Womb Cave',
    category: 'inner',
    junctions: ['bottom', 'top'],
    visualKeys: [],
    latticeNodes: [
      { position: { x: 30, y: 36 }, size: 'S' },
      { position: { x: 68, y: 25 }, size: 'L' },
      { position: { x: 25, y: 82 }, size: 'S' },
      { position: { x: 54, y: 78 }, size: 'L' },
      { position: { x: 53, y: 60 }, size: 'M' },
    ]
  },
  EndNBoss01: {
    id: 'EndNBoss01',
    name: 'Dead End Bossroom',
    category: 'boss',
    junctions: ['bottom'],
    visualKeys: [
      { icon: 'rareMetal', position: { x: 50, y: 65 } },
      { icon: 'rareMetal', position: { x: 15, y: 62 } },
      { icon: 'rareMetal', position: { x: 28, y: 43 } },
      { icon: 'rareMetal', position: { x: 50, y: 34 } },
    ],
    latticeNodes: []
  },
  StraightNBoss01: {
    id: 'StraightNBoss01',
    name: 'Passthrough Bossroom',
    category: 'boss',
    junctions: ['bottom', 'top'],
    visualKeys: [
      { icon: 'rareMetal', position: { x: 68, y: 35 } }
    ],
    latticeNodes: []
  }
};

export const CATEGORY_META = {
  outer: {
    label: 'Outer Modules',
    modalTitle: 'Outer Modules',
    cardTheme: 'bg-tactical-panel border-emerald-500/50 text-emerald-300',
    sidebarBorder: 'border-l-emerald-500/50',
    modalHighlight: 'border-emerald-500/30',
    borderClass: 'border-emerald-500/50',
  },
  inner: {
    label: 'Inner Modules',
    modalTitle: 'Inner Modules',
    cardTheme: 'bg-tactical-panel border-indigo-500/50 text-indigo-300',
    sidebarBorder: 'border-l-indigo-500/50',
    modalHighlight: 'border-indigo-500/30',
    borderClass: 'border-indigo-500/50',
  },
  boss: {
    label: 'Boss Modules',
    modalTitle: 'Boss Modules',
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

export const LATTICE_NODE_CUBE_COUNTS = {
  S: 240,
  M: 256,
  L: 600,
};

export const RESOURCE_RATIOS = {
  IronMalachite: 
  {
    Iron: 0.20, 
    Malachite: 0.20 
  },
  Cassiterite: 
  { 
    Cassiterite: 0.40
  },
  Coal: 
  { 
    Coal: 0.40 
  },
};

export const getTemplateLabel = (tmpl, showId) => tmpl[showId ? 'id' : 'name'];
