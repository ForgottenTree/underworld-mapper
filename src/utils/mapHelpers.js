// src/utils/mapHelpers.js
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

// Returns rotation angles at which the module satisfies ALL required directions.
// With no requirements (isolated module), all rotations are valid.
export function getValidRotationsMulti(templateJunctions, requiredDirs) {
  if (requiredDirs.length === 0) return [...ROTATIONS];
  return ROTATIONS.filter(angle => {
    const globalJuncs = getGlobalJunctions(templateJunctions, angle);
    return requiredDirs.every(dir => globalJuncs.includes(dir));
  });
}