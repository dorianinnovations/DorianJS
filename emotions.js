// === emotions.js ===

//Archetpypes and emergent emotions based on primary emotions
export const EMOTIONS = {
  0: { name: "Joyful", color: [255, 255, 0] },
  1: { name: "Trusting", color: [0, 255, 120] },
  2: { name: "Fear", color: [0, 153, 153] },
  3: { name: "Surprised", color: [102, 0, 204] },
  4: { name: "Sad", color: [51, 102, 204] },
  5: { name: "Disgusted", color: [230, 0, 120] },
  6: { name: "Angry", color: [255, 0, 0] },
  7: { name: "Anticipation", color: [255, 128, 0] },

  // NEW: Emergent emotion archetypes with unique IDs
  8: { name: "Affectionate", parents: [0, 1], description: "Warmth, care, social bonding", color: [255, 200, 100] },
  9: { name: "Shocked", parents: [2, 3], description: "Hypervigilance, rapid reaction", color: [150, 50, 200] },
  10: { name: "Contempt", parents: [6, 5], description: "Moral superiority, rejection", color: [200, 0, 100] },
  11: { name: "Hopeful", parents: [1, 7], description: "Expectation of good outcome", color: [100, 255, 180] },
  12: { name: "Depressed", parents: [4, 5], description: "Self-critique, regret", color: [100, 100, 180] },
  13: { name: "Delight", parents: [0, 3], description: "Sudden happiness", color: [255, 220, 50] },
  14: { name: "Anxiety", parents: [2, 7], description: "Future-oriented dread", color: [50, 100, 200] },
  15: { name: "Aggression", parents: [6, 7], description: "Proactive forceful behavior", color: [255, 50, 50] },
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
  const px = x / cols, py = y / rows;
  // Add some randomness to soften boundaries
  // Increase randomness for more varied zone assignment
  const jitterX = (Math.random() - 0.5) * 0.5; // up to ±0.25
  const jitterY = (Math.random() - 0.5) * 0.5; // up to ±0.25
  const pxj = Math.min(Math.max(px + jitterX, 0), 1);
  const pyj = Math.min(Math.max(py + jitterY, 0), 1);

  // Randomly shuffle the order of zone checks for extra unpredictability
  const zones = [
    { cond: pxj < 0.4 && pyj < 0.4, zone: 'mountain' },
    { cond: pxj > 0.6 && pyj < 0.4, zone: 'desert' },
    { cond: pxj < 0.4 && pyj > 0.6, zone: 'ocean' },
    { cond: pxj > 0.6 && pyj > 0.6, zone: 'valley' }
  ];
  // Shuffle zones array
  for (let i = zones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [zones[i], zones[j]] = [zones[j], zones[i]];
  }
  for (const z of zones) {
    if (z.cond) return z.zone;
  }
  // Add a small chance to randomly pick any zone
  if (Math.random() < 0.1) {
    const allZones = ['mountain', 'desert', 'ocean', 'valley', 'forest'];
    return allZones[Math.floor(Math.random() * allZones.length)];
  }
  return 'forest';
}
