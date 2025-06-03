// emotions.js

export const EMOTION_ID_TO_NAME = {
  0: "joy", 1: "fear", 2: "anger", 3: "calm", 4: "envy",
  5: "love", 6: "sadness", 7: "hope", 8: "curiosity", 9: "pride"
};

export const EMOTION_NAME_TO_ID = Object.fromEntries(
  Object.entries(EMOTION_ID_TO_NAME).map(([k, v]) => [v, parseInt(k)])
);

export const EMOTIONS = {
  0: { color: [255, 230, 70], vector: [1, -1], archetype: "vital" },
  1: { color: [90, 130, 255], vector: [-1, 1], archetype: "shadow" },
  2: { color: [255, 60, 60], vector: [1, 0], archetype: "shadow" },
  3: { color: [100, 255, 180], vector: [-1, 0], archetype: "neutral" },
  4: { color: [200, 100, 255], vector: [0, -1], archetype: "ego" },
  5: { color: [255, 160, 210], vector: [0, 1], archetype: "vital" },
  6: { color: [130, 150, 255], vector: [-1, -1], archetype: "shadow" },
  7: { color: [100, 255, 200], vector: [1, 1], archetype: "hope" },
  8: { color: [255, 200, 120], vector: [0, 0], archetype: "curious" },
  9: { color: [255, 245, 100], vector: [1, 0], archetype: "ego" }
};

export const EMOTION_LIST = Object.keys(EMOTIONS).map(e => parseInt(e));
