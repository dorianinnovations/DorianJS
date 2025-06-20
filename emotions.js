// === emotions.js ===
// Archetypes and emergent emotions based on primary emotions
export const EMOTIONS = {
  0: { name: "Joy", color: [255, 255, 0], intensity: 1.0, stability: 0.7, contagion: 0.8 },
  1: { name: "Trust", color: [0, 255, 120], intensity: 0.8, stability: 0.9, contagion: 0.6 },
  2: { name: "Fear", color: [0, 153, 153], intensity: 0.9, stability: 0.3, contagion: 0.9 },
  3: { name: "Surprise", color: [102, 0, 204], intensity: 1.0, stability: 0.2, contagion: 0.5 },
  4: { name: "Sadness", color: [51, 102, 204], intensity: 0.7, stability: 0.8, contagion: 0.4 },
  5: { name: "Disgust", color: [230, 0, 120], intensity: 0.8, stability: 0.6, contagion: 0.7 },
  6: { name: "Angry", color: [255, 0, 0], intensity: 1.0, stability: 0.4, contagion: 0.9 },
  7: { name: "Anticipation", color: [255, 128, 0], intensity: 0.6, stability: 0.5, contagion: 0.3 },
  
  // Emergent emotions with enhanced properties
  8: { name: "Affectionate", parents: [0, 1], description: "Warmth, care, social bonding", 
       color: [255, 200, 100], intensity: 0.7, stability: 0.8, contagion: 0.7, tier: 2 },
  9: { name: "Shocked", parents: [2, 3], description: "Hypervigilance, rapid reaction", 
       color: [150, 50, 200], intensity: 1.0, stability: 0.1, contagion: 0.8, tier: 2 },
  10: { name: "Contempt", parents: [6, 5], description: "Moral superiority, rejection", 
        color: [200, 0, 100], intensity: 0.8, stability: 0.7, contagion: 0.6, tier: 2 },
  11: { name: "Hopeful", parents: [1, 7], description: "Expectation of good outcome", 
        color: [100, 255, 180], intensity: 0.6, stability: 0.6, contagion: 0.5, tier: 2 },
  12: { name: "Depressed", parents: [4, 5], description: "Self-critique, regret", 
        color: [100, 100, 180], intensity: 0.9, stability: 0.9, contagion: 0.3, tier: 2 },
  13: { name: "Delight", parents: [0, 3], description: "Sudden happiness", 
        color: [255, 220, 50], intensity: 1.0, stability: 0.3, contagion: 0.8, tier: 2 },
  14: { name: "Anxiety", parents: [2, 7], description: "Future-oriented dread", 
        color: [50, 100, 200], intensity: 0.8, stability: 0.6, contagion: 0.7, tier: 2 },
  15: { name: "Aggression", parents: [6, 7], description: "Proactive forceful behavior", 
        color: [255, 50, 50], intensity: 0.9, stability: 0.5, contagion: 0.8, tier: 2 },
  
  // Third-tier complex emotions (combinations of emergent emotions)
  16: { name: "Euphoric", parents: [13, 8], description: "Overwhelming joy with connection", 
        color: [255, 180, 80], intensity: 1.0, stability: 0.2, contagion: 0.9, tier: 3 },
  17: { name: "Melancholy", parents: [12, 11], description: "Sad hope, bittersweet longing", 
        color: [120, 150, 200], intensity: 0.6, stability: 0.8, contagion: 0.4, tier: 3 },
  18: { name: "Vindictive", parents: [10, 15], description: "Calculated revenge", 
        color: [180, 20, 80], intensity: 0.8, stability: 0.9, contagion: 0.5, tier: 3 },
  19: { name: "Panic", parents: [9, 14], description: "Overwhelming fear and shock", 
        color: [100, 25, 150], intensity: 1.0, stability: 0.1, contagion: 1.0, tier: 3 }
};

// Emotional relationships and interactions
export const EMOTION_RELATIONSHIPS = {
  // Amplifiers - emotions that strengthen each other
  amplifies: {
    0: [1, 7, 13], // Joy amplifies Trust, Anticipation, Delight
    6: [2, 15], // Anger amplifies Fear, Aggression
    2: [14, 9], // Fear amplifies Anxiety, Shock
    4: [12, 17] // Sadness amplifies Depression, Melancholy
  },
  
  // Suppressors - emotions that weaken each other
  suppresses: {
    0: [4, 2, 12], // Joy suppresses Sadness, Fear, Depression
    1: [6, 5, 10], // Trust suppresses Anger, Disgust, Contempt
    4: [0, 13, 16], // Sadness suppresses Joy, Delight, Euphoria
    6: [1, 8, 11] // Anger suppresses Trust, Affection, Hope
  },
  
  // Transformers - emotions that can evolve into others under certain conditions
  transforms: {
    2: { into: 6, condition: 'threatened', probability: 0.3 }, // Fear -> Anger when threatened
    4: { into: 12, condition: 'prolonged', probability: 0.4 }, // Sadness -> Depression over time
    7: { into: 14, condition: 'uncertainty', probability: 0.5 }, // Anticipation -> Anxiety with uncertainty
    11: { into: 17, condition: 'disappointment', probability: 0.6 } // Hope -> Melancholy with disappointment
  }
};

// Enhanced terrain with multiple layers of influence
export const terrainZones = {
  'desert': { 
    supports: ['Joy', 'Anticipation', 'Delight'], 
    resists: ['Sadness', 'Disgust', 'Melancholy'],
    intensity_modifier: 1.2,
    stability_modifier: 0.8,
    weather_effects: ['sandstorm', 'heat_wave', 'oasis']
  },
  'ocean': { 
    supports: ['Fear', 'Sadness', 'Melancholy'], 
    resists: ['Angry', 'Aggression'],
    intensity_modifier: 0.9,
    stability_modifier: 1.1,
    weather_effects: ['storm', 'calm', 'tsunami']
  },
  'forest': { 
    supports: ['Trust', 'Surprise', 'Affectionate'], 
    resists: ['Joy', 'Euphoric'],
    intensity_modifier: 1.0,
    stability_modifier: 1.2,
    weather_effects: ['rain', 'mist', 'sunbeam']
  },
  'mountain': { 
    supports: ['Angry', 'Aggression', 'Vindictive'], 
    resists: ['Joy', 'Fear', 'Panic'],
    intensity_modifier: 1.3,
    stability_modifier: 0.9,
    weather_effects: ['avalanche', 'wind', 'echo']
  },
  'valley': { 
    supports: ['Sadness', 'Trust', 'Hopeful'], 
    resists: ['Disgust', 'Surprise', 'Shocked'],
    intensity_modifier: 0.8,
    stability_modifier: 1.3,
    weather_effects: ['fog', 'bloom', 'flood']
  },
  
  // New biomes for complexity
  'volcanic': {
    supports: ['Angry', 'Shocked', 'Panic', 'Euphoric'],
    resists: ['Trust', 'Hopeful', 'Melancholy'],
    intensity_modifier: 1.5,
    stability_modifier: 0.5,
    weather_effects: ['eruption', 'ash_fall', 'lava_flow']
  },
  'arctic': {
    supports: ['Fear', 'Contempt', 'Depressed'],
    resists: ['Joy', 'Affectionate', 'Delight'],
    intensity_modifier: 0.7,
    stability_modifier: 1.4,
    weather_effects: ['blizzard', 'aurora', 'ice_crack']
  },
  'swamp': {
    supports: ['Disgust', 'Anxiety', 'Depressed'],
    resists: ['Trust', 'Joy', 'Hopeful'],
    intensity_modifier: 0.9,
    stability_modifier: 0.7,
    weather_effects: ['miasma', 'will_o_wisp', 'stagnation']
  }
};

// Time-based emotional cycles
export const EMOTIONAL_CYCLES = {
  circadian: {
    dawn: { boosts: ['Hopeful', 'Anticipation'], dampens: ['Depressed', 'Fear'] },
    day: { boosts: ['Joy', 'Trust', 'Delight'], dampens: ['Anxiety', 'Melancholy'] },
    dusk: { boosts: ['Melancholy', 'Contempt'], dampens: ['Euphoric', 'Shocked'] },
    night: { boosts: ['Fear', 'Anxiety', 'Sadness'], dampens: ['Joy', 'Trust'] }
  },
  seasonal: {
    spring: { global_modifier: 1.2, favors: ['Joy', 'Hopeful', 'Affectionate'] },
    summer: { global_modifier: 1.1, favors: ['Euphoric', 'Aggression', 'Delight'] },
    autumn: { global_modifier: 0.9, favors: ['Melancholy', 'Contempt', 'Anxiety'] },
    winter: { global_modifier: 0.8, favors: ['Depressed', 'Fear', 'Sadness'] }
  }
};

// Memory system for emotional history
export class EmotionalMemory {
  constructor(capacity = 100) {
    this.history = [];
    this.capacity = capacity;
    this.patterns = new Map();
  }
  
  record(emotion, intensity, context) {
    const entry = {
      emotion,
      intensity,
      context,
      timestamp: Date.now()
    };
    
    this.history.push(entry);
    if (this.history.length > this.capacity) {
      this.history.shift();
    }
    
    this.updatePatterns(entry);
  }
  
  updatePatterns(entry) {
    const key = `${entry.emotion}_${entry.context?.zone || 'unknown'}`;
    const existing = this.patterns.get(key) || { count: 0, avgIntensity: 0 };
    existing.count++;
    existing.avgIntensity = (existing.avgIntensity * (existing.count - 1) + entry.intensity) / existing.count;
    this.patterns.set(key, existing);
  }
  
  getEmotionalTendency(emotion, context) {
    const key = `${emotion}_${context?.zone || 'unknown'}`;
    const pattern = this.patterns.get(key);
    return pattern ? pattern.avgIntensity : 0.5;
  }
}

// Enhanced zone detection with multiple factors
export function getZone(x, y, cols = 200, rows = 200, weather = null, season = 'spring') {
  const px = x / cols, py = y / rows;
  
  // Base terrain noise
  const noise1 = Math.sin(px * 10) * Math.cos(py * 10);
  const noise2 = Math.sin(px * 20 + Math.PI/4) * Math.cos(py * 20 + Math.PI/4);
  const combined_noise = (noise1 + noise2 * 0.5) / 1.5;
  
  // Weather influence on zone selection
  let weather_bias = 0;
  if (weather === 'storm') weather_bias = -0.2;
  if (weather === 'heat_wave') weather_bias = 0.3;
  if (weather === 'blizzard') weather_bias = -0.4;
  
  const adjusted_noise = combined_noise + weather_bias;
  
  // Zone mapping with smoother transitions
  const zones = [
    { range: [-1, -0.6], zone: 'arctic' },
    { range: [-0.6, -0.3], zone: 'mountain' },
    { range: [-0.3, -0.1], zone: 'forest' },
    { range: [-0.1, 0.1], zone: 'valley' },
    { range: [0.1, 0.3], zone: 'desert' },
    { range: [0.3, 0.5], zone: 'ocean' },
    { range: [0.5, 0.7], zone: 'swamp' },
    { range: [0.7, 1], zone: 'volcanic' }
  ];
  
  for (const z of zones) {
    if (adjusted_noise >= z.range[0] && adjusted_noise < z.range[1]) {
      return z.zone;
    }
  }
  
  return 'forest'; // fallback
}

// Utility functions for working with complex emotions
export const EMOTION_LIST = Object.keys(EMOTIONS).map(k => parseInt(k));
export const EMOTION_ID_TO_NAME = Object.fromEntries(
  Object.entries(EMOTIONS).map(([k, v]) => [parseInt(k), v.name])
);

export function getEmotionsByTier(tier) {
  return EMOTION_LIST.filter(id => EMOTIONS[id].tier === tier || (!EMOTIONS[id].tier && tier === 1));
}

export function calculateEmotionalInfluence(sourceEmotion, targetEmotion, distance, sourceIntensity) {
  const source = EMOTIONS[sourceEmotion];
  const target = EMOTIONS[targetEmotion];
  
  if (!source || !target) return 0;
  
  // Base influence calculation
  let influence = (source.contagion * sourceIntensity) / (1 + distance * 0.1);
  
  // Relationship modifiers
  if (EMOTION_RELATIONSHIPS.amplifies[sourceEmotion]?.includes(targetEmotion)) {
    influence *= 1.5;
  }
  if (EMOTION_RELATIONSHIPS.suppresses[sourceEmotion]?.includes(targetEmotion)) {
    influence *= -0.8;
  }
  
  return Math.max(-1, Math.min(1, influence));
}

export function shouldTransformEmotion(emotionId, context, intensity) {
  const transform = EMOTION_RELATIONSHIPS.transforms[emotionId];
  if (!transform) return null;
  
  // Check if conditions are met
  let conditionMet = false;
  switch (transform.condition) {
    case 'threatened':
      conditionMet = context?.threat_level > 0.5;
      break;
    case 'prolonged':
      conditionMet = context?.duration > 100; // arbitrary time units
      break;
    case 'uncertainty':
      conditionMet = context?.uncertainty > 0.6;
      break;
    case 'disappointment':
      conditionMet = context?.expectation_vs_reality < -0.3;
      break;
  }
  
  if (conditionMet && Math.random() < transform.probability * intensity) {
    return transform.into;
  }
  
  return null;
}