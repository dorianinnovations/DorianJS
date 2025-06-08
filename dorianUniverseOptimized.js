import { EMOTIONS, EMOTION_LIST, EMOTION_ID_TO_NAME, getZone, terrainZones } from './emotions.js';

export class DorianUniverseOptimized {
  constructor({ cols = 200, rows = 200, maxAge = 2000, mutationChance = 0.05, birthDelay = 1 } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.size = cols * rows;
    this.maxAge = maxAge;
    this.mutationChance = mutationChance;
    this.birthDelay = birthDelay;

    this.lifeForce = new Float32Array(this.size);
    this.emotion = new Uint8Array(this.size);
    this.intensity = new Float32Array(this.size);
    this.age = new Uint16Array(this.size);
    this.energy = new Float32Array(this.size);
    this.groupId = new Uint16Array(this.size);
    this.groupMeta = new Map();
    this.nextGroupId = 1;

    this.active = new Set();
    this.tick = 0;

    this.supportMap = new Array(this.size);
    this.resistMap = new Array(this.size);
    this.neighborMap = new Array(this.size);

    this.emotionRelations = {
      0: { helps: [1], harms: [6] }, // Joy helps Trust, harmed by Anger
      1: { helps: [0, 4], harms: [] }, // Trust helps Joy and Sadness
      2: { helps: [], harms: [3] }, // Fear harms Surprise
      3: { helps: [], harms: [5] }, // Surprise harms Disgust
      4: { helps: [], harms: [0] }, // Sadness harms Joy
      5: { helps: [], harms: [2] }, // Disgust harms Fear
      6: { helps: [], harms: [1, 0] }, // Anger harms Trust, Joy
      7: { helps: [3], harms: [] }  // Anticipation helps Surprise
    };

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = this.index(x, y);
        const zone = getZone(x, y, this.cols, this.rows);
        const supported = terrainZones[zone]?.supports || [];
        const resisted = terrainZones[zone]?.resists || [];
        this.supportMap[idx] = new Set(supported);
        this.resistMap[idx] = new Set(resisted);

        const neighbors = [];
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < this.cols && ny < this.rows) {
              neighbors.push(this.index(nx, ny));
            }
          }
        }
        this.neighborMap[idx] = neighbors;
      }
    }
  }

  index(x, y) {
    return y * this.cols + x;
  }

  coords(idx) {
    return [idx % this.cols, Math.floor(idx / this.cols)];
  }

  randomEmotion() {
    return EMOTION_LIST[Math.floor(Math.random() * EMOTION_LIST.length)];
  }

  seed(cx, cy) {
    const group = this.nextGroupId++;
    const emotion = this.randomEmotion();
    this.groupMeta.set(group, {
      dominantEmotion: emotion,
      spreadRate: 0.0001 + Math.random() * 0.05,
      aggression: Math.random(),
      mutationBias: Math.random()
    });
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && y >= 0 && x < this.cols && y < this.rows) {
          const idx = this.index(x, y);
          this.lifeForce[idx] = 0.5 + Math.random() * 0.5; // Initial life force
          this.emotion[idx] = emotion;
          this.intensity[idx] = 1.0;
          this.energy[idx] = 300;
          this.age[idx] = 0;
          this.groupId[idx] = group;
          this.active.add(idx);
        }
      }
    }
  }

  update() {
    const nextActive = new Set();
    const toUpdate = Array.from(this.active);
    const emotionCounts = new Map();

    for (const idx of toUpdate) {
      const neighbors = this.neighborMap[idx];
      const lf = this.lifeForce[idx];
      const emotion = this.emotion[idx];
      const group = this.groupId[idx];

      const meta = this.groupMeta.get(group);
      if (!meta) continue;

      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);

      if (lf <= 0) continue;

      // Terrain influence
      if (this.supportMap[idx].has(EMOTION_ID_TO_NAME[emotion])) {
        this.energy[idx] *= 1.02;
      } else if (this.resistMap[idx].has(EMOTION_ID_TO_NAME[emotion])) {
        this.energy[idx] *= 0.95;
        this.lifeForce[idx] *= 0.98;
      }

      // Emotion relations
      const relations = this.emotionRelations[emotion] || {};
      for (const n of neighbors) {
        if (this.lifeForce[n] <= 0) continue;
        const neighborEmotion = this.emotion[n];
        if (relations.helps?.includes(neighborEmotion)) {
          this.energy[n] += 0.01;
        }
        if (relations.harms?.includes(neighborEmotion)) {
          this.lifeForce[n] *= 0.97;
        }
      }

      // Spread
      for (const n of neighbors) {
        if (this.lifeForce[n] <= 0 && Math.random() < meta.spreadRate) {
          this.lifeForce[n] = 0.3 + Math.random() * 0.3;
          this.energy[n] = 0.1 + Math.random() * 0.2;
          this.intensity[n] = 0.6 + Math.random() * 0.3;
          this.emotion[n] = emotion;
          this.groupId[n] = group;
          this.age[n] = 0;
          nextActive.add(n);
        }
      }

      // Decay
      this.age[idx]++;
      this.energy[idx] -= 0.02 + Math.random() * 0.03;
      this.intensity[idx] = Math.max(0.05, this.intensity[idx] - (0.003 + Math.random() * 0.005));
      this.lifeForce[idx] -= 0.002 + Math.random() * 0.003;

      if (this.energy[idx] <= 0 || this.lifeForce[idx] <= 0) {
        this.lifeForce[idx] = 0;
        continue;
      }

      nextActive.add(idx);
      neighbors.forEach(n => nextActive.add(n));
    }
    this.active = nextActive;
    this.tick++;
  }

  getStats() {
    const counts = {};
    let total = 0;
    for (let i = 0; i < this.size; i++) {
      if (this.lifeForce[i] > 0.1) {
        const eid = this.emotion[i];
        counts[eid] = (counts[eid] || 0) + 1;
        total++;
      }
    }
    let dominant = "None";
    let max = 0;
    for (let eid in counts) {
      if (counts[eid] > max) {
        max = counts[eid];
        dominant = EMOTION_ID_TO_NAME[eid];
      }
    }
    const diversity = Object.keys(counts).length;
    const entropy = total > 0 ? (
      -(Object.values(counts).map(count => {
        const p = count / total;
        return p * Math.log2(p);
      }).reduce((a, b) => a + b, 0)).toFixed(2)
    ) : '0.00';
    return {
      tick: this.tick,
      dominant,
      diversity,
      entropy,
      alive: total
    };
  }

  getImageData(cellSize = 5) {
    const width = this.cols * cellSize;
    const height = this.rows * cellSize;
    const imageData = new ImageData(width, height);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = this.index(x, y);
        if (this.lifeForce[idx] > 0.1) {
          const [r, g, b] = EMOTIONS[this.emotion[idx]].color;
          const fade = Math.max(0.2, Math.min(1.0, this.intensity[idx]));
          const cr = Math.min(255, r * fade);
          const cg = Math.min(255, g * fade);
          const cb = Math.min(255, b * fade);
          for (let dy = 0; dy < cellSize; dy++) {
            for (let dx = 0; dx < cellSize; dx++) {
              const px = (y * cellSize + dy) * width + (x * cellSize + dx);
              imageData.data[px * 4 + 0] = cr;
              imageData.data[px * 4 + 1] = cg;
              imageData.data[px * 4 + 2] = cb;
              imageData.data[px * 4 + 3] = 255;
            }
          }
        }
      }
    }
    return imageData;
  }
}