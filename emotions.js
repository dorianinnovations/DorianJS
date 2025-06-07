// === emotions.js ===

export const EMOTIONS = {
  0: { name: "Joy", color: [255, 230, 0] },
  1: { name: "Trust", color: [0, 204, 102] },
  2: { name: "Fear", color: [0, 153, 153] },
  3: { name: "Surprise", color: [102, 0, 204] },
  4: { name: "Sadness", color: [51, 102, 204] },
  5: { name: "Disgust", color: [153, 51, 102] },
  6: { name: "Anger", color: [204, 0, 0] },
  7: { name: "Anticipation", color: [255, 102, 0] }
};

export const EMOTION_LIST = Object.keys(EMOTIONS).map(k => parseInt(k));
export const EMOTION_ID_TO_NAME = Object.fromEntries(
  Object.entries(EMOTIONS).map(([k, v]) => [parseInt(k), v.name])
);

// Terrain zones for emotional effects
export const terrainZones = {
  'desert':    { decay_modifier: 4.0, boost: [0, 7], suppress: [4, 5] },
  'ocean':     { decay_modifier: 3.5, boost: [2, 4], suppress: [6] },
  'forest':    { decay_modifier: 2.5, boost: [1, 3], suppress: [0] },
  'mountain':  { decay_modifier: 1.5, boost: [6], suppress: [2, 0] },
  'valley':    { decay_modifier: 1.0, boost: [4, 1], suppress: [3, 5] }
};

// Return the terrain type based on coordinates (symbolic, not literal geography)
export function getZone(x, y) {
  const px = (x / 200), py = (y / 200);
  if (px < 0.3 && py < 0.3) return 'mountain';
  if (px > 0.7 && py < 0.3) return 'desert';
  if (px < 0.3 && py > 0.7) return 'ocean';
  if (px > 0.7 && py > 0.7) return 'valley';
  return 'forest';
} 
