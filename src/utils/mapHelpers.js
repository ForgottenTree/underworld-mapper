import { ROTATIONS, DIRECTION_OFFSETS, MODULE_TEMPLATES } from '../constants/mapData';

export function getGlobalJunctions(templateJunctions, rotation) {
  const directions = ['top', 'right', 'bottom', 'left'];
  const shift = rotation / 90;
  return templateJunctions.flatMap(localDir => {
    const localIdx = directions.indexOf(localDir);
    if (localIdx === -1) return [];
    return [directions[(localIdx + shift) % 4]];
  });
}

// Returns all junction directions that a cell at (x, y) MUST have,
// based on which adjacent placed modules already have junctions pointing toward it.
// Used for both placement validation and rotation validation.
export function getRequiredDirections(x, y, modules) {
  const required = [];
  Object.entries(DIRECTION_OFFSETS).forEach(([dir, offset]) => {
    const neighbor = modules[`${x + offset.x},${y + offset.y}`];
    if (!neighbor) return;
    const template = MODULE_TEMPLATES[neighbor.templateId];
    if (!template) return;
    const neighborGlobalJunctions = getGlobalJunctions(template.junctions, neighbor.rotation);
    // offset.opposite is the direction from the neighbor toward (x, y)
    if (neighborGlobalJunctions.includes(offset.opposite)) {
      required.push(dir);
    }
  });
  return required;
}

// BFS through the junction graph from a set of starting keys.
// Two adjacent modules are connected only when both have a matching junction facing each other.
// Returns a Set of all reachable module keys within the given modules map.
export function getReachableKeys(startKeys, modules) {
  const reachable = new Set(startKeys);
  const queue = [...startKeys];
  while (queue.length > 0) {
    const current = queue.shift();
    const mod = modules[current];
    if (!mod) continue;
    const tmpl = MODULE_TEMPLATES[mod.templateId];
    if (!tmpl) continue;
    getGlobalJunctions(tmpl.junctions, mod.rotation).forEach(juncDir => {
      const offset = DIRECTION_OFFSETS[juncDir];
      const neighborKey = `${mod.x + offset.x},${mod.y + offset.y}`;
      if (reachable.has(neighborKey)) return;
      const neighbor = modules[neighborKey];
      if (!neighbor) return;
      const neighborTmpl = MODULE_TEMPLATES[neighbor.templateId];
      if (!neighborTmpl) return;
      if (getGlobalJunctions(neighborTmpl.junctions, neighbor.rotation).includes(offset.opposite)) {
        reachable.add(neighborKey);
        queue.push(neighborKey);
      }
    });
  }
  return reachable;
}

// Returns rotation angles at which the module satisfies ALL required directions.
// With no requirements (isolated module), all rotations are valid.
export function getValidRotationsMulti(templateJunctions, requiredDirs) {
  if (requiredDirs.length === 0) return [...ROTATIONS];
  return ROTATIONS.filter(angle => {
    const globalJuncs = getGlobalJunctions(templateJunctions, angle);
    return requiredDirs.every(dir => globalJuncs.includes(dir));
  });
}