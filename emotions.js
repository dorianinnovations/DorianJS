// === emotions.js ===

export const EMOTIONS = {
  0: { name: "Joy", color: [255, 255, 0] },
  1: { name: "Trust", color: [0, 255, 120] },
  2: { name: "Fear", color: [0, 153, 153] },
  3: { name: "Surprise", color: [102, 0, 204] },
  4: { name: "Sadness", color: [51, 102, 204] },
  5: { name: "Disgust", color: [230, 0, 120] },
  6: { name: "Anger", color: [255, 0, 0] },
  7: { name: "Anticipation", color: [255, 128, 0] }
};

export const EMOTION_LIST = Object.keys(EMOTIONS).map(k => parseInt(k));
export const EMOTION_ID_TO_NAME = Object.fromEntries(
  Object.entries(EMOTIONS).map(([k, v]) => [parseInt(k), v.name])
);

// Terrain zones for emotional effects (softened effects for subtle emergence)
export const terrainZones = {
  'desert':    { supports: ['Joy', 'Anticipation'], resists: ['Sadness', 'Disgust'] },
  'ocean':     { supports: ['Fear', 'Sadness'],     resists: ['Anger'] },
  'forest':    { supports: ['Trust', 'Surprise'],   resists: ['Joy'] },
  'mountain':  { supports: ['Anger'],               resists: ['Joy', 'Fear'] },
  'valley':    { supports: ['Sadness', 'Trust'],    resists: ['Disgust', 'Surprise'] }
};

// Return the terrain type based on coordinates (even spread, no harsh edges)
export function getZone(x, y, cols = 200, rows = 200) {
  const px = (x / cols), py = (y / rows);
  if (px < 0.4 && py < 0.4) return 'mountain';
  if (px > 0.6 && py < 0.4) return 'desert';
  if (px < 0.4 && py > 0.6) return 'ocean';
  if (px > 0.6 && py > 0.6) return 'valley';
  return 'forest';
}
