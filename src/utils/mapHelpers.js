// src/utils/mapHelpers.js
import { ROTATIONS } from '../constants/mapData';

export function getGlobalJunctions(templateJunctions, rotation) {
  const directions = ['top', 'right', 'bottom', 'left'];
  return templateJunctions.map(localDir => {
    const localIdx = directions.indexOf(localDir);
    const shift = rotation / 90;
    const globalIdx = (localIdx + shift) % 4;
    return directions[globalIdx];
  });
}

// NEW: Finds which rotation angles align a module's junction with the required incoming direction
export function getValidRotations(templateJunctions, incomingGlobalDir) {
  const validAngles = [];
  ROTATIONS.forEach(angle => {
    const globalJuncs = getGlobalJunctions(templateJunctions, angle);
    if (globalJuncs.includes(incomingGlobalDir)) {
      validAngles.push(angle);
    }
  });
  return validAngles;
}