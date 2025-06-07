// === dorianUniverseOptimized.js ===
import { EMOTIONS, EMOTION_LIST, EMOTION_ID_TO_NAME, getZone, terrainZones } from './emotions.js';

export class DorianUniverseOptimized {
  constructor({ cols = 200, rows = 200, maxAge = 800, mutationChance = 0.006, birthDelay = 1 } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.size = cols * rows;
    this.maxAge = maxAge;
    this.mutationChance = mutationChance;
    // Typed arrays for state, emotion, intensity, age, energy
    this.state = new Uint8Array(this.size); // 0 = dead, 1 = alive
    this.emotion = new Uint8Array(this.size); // emotion id
    this.intensity = new Float32Array(this.size);
    this.age = new Uint16Array(this.size);
    this.energy = new Float32Array(this.size);
    // Set of active cell indices
    this.active = new Set();
    this.tick = 0;
    this.birthDelay = birthDelay; // minimum ticks a cell must stay dead before rebirth
    // --- Fix: Initialize memory arrays ONCE here ---
    this._deadTicks = new Uint16Array(this.size); // tracks how long each cell has been dead
    this._aliveTicks = new Uint16Array(this.size);
    // Precompute neighbor lists for quick lookup
    this.neighborMap = new Array(this.size);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = this.index(x, y);
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

  setMutationChance(value) {
    this.mutationChance = value;
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
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && y >= 0 && x < this.cols && y < this.rows) {
          const idx = this.index(x, y);
          this.state[idx] = 1;
          this.emotion[idx] = this.randomEmotion();
          this.intensity[idx] = 1.0;
          this.energy[idx] = 10;
          this.age[idx] = 0;
          this.active.add(idx);
        }
      }
    }
  }

  getNeighbors(x, y) {
    return this.neighborMap[this.index(x, y)];
  }

  update() {
    const nextActive = new Set();
    const toUpdate = Array.from(this.active);
    for (const idx of toUpdate) {
      const [x, y] = this.coords(idx);
      const zone = getZone(x, y);
      const { decay_modifier: mod, boost, suppress } = terrainZones[zone];
      const neighbors = this.neighborMap[idx];
      const liveNeighbors = neighbors.filter(nidx => this.state[nidx]);
      // --- CLUSTERING INCENTIVE LOGIC ---
      if (!this.state[idx]) {
        // Affinity bias: more likely to be born if most neighbors are same emotion
        let affinity = 0;
        let maxEmotion = null;
        if (liveNeighbors.length > 0) {
          const emotionCounts = {};
          for (const nidx of liveNeighbors) {
            const eid = this.emotion[nidx];
            emotionCounts[eid] = (emotionCounts[eid] || 0) + 1;
          }
          maxEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
          const maxCount = emotionCounts[maxEmotion];
          affinity = maxCount / liveNeighbors.length;
        }
        // Overcrowding penalty: less likely to be born if too many neighbors
        const overcrowded = liveNeighbors.length >= 7;
        // Adjust base birth chance (stronger effect)
        let birthChance = 0.18;
        birthChance += 0.45 * affinity; // up to 0.63 if all neighbors are same emotion
        if (overcrowded) birthChance *= 0.08; // even stronger penalty if overcrowded
        // --- MEMORY/AGE-BASED RULES: Only allow birth if cell has been dead for at least `birthDelay` ticks ---
        if (this._deadTicks[idx] < this.birthDelay) {
          this._deadTicks[idx]++;
          continue;
        }
        if ((liveNeighbors.length === 3 || liveNeighbors.length === 4) && Math.random() < birthChance) {
          let chosen;
          if (affinity > 0.5 && maxEmotion !== null) {
            const maxEmotionNeighbors = liveNeighbors.filter(nidx => this.emotion[nidx] == maxEmotion);
            chosen = maxEmotionNeighbors[Math.floor(Math.random() * maxEmotionNeighbors.length)];
          } else {
            chosen = liveNeighbors[Math.floor(Math.random() * liveNeighbors.length)];
          }
          this.state[idx] = 1;
          this.emotion[idx] = Math.random() > this.mutationChance ? this.emotion[chosen] : this.randomEmotion();
          this.intensity[idx] = 1.0;
          this.energy[idx] = 10;
          this.age[idx] = 0;
          this._deadTicks[idx] = 0; // reset dead counter ON BIRTH
          this._aliveTicks[idx] = 1; // start alive counter
          nextActive.add(idx);
          neighbors.forEach(n => nextActive.add(n));
        } else {
          this._deadTicks[idx]++;
        }
        continue;
      }
      // Alive cell
      // Overcrowding penalty: die if too many live neighbors
      if (liveNeighbors.length >= 7) {
        this.state[idx] = 0;
        this._deadTicks[idx] = 1; // start dead counter ON DEATH
        this._aliveTicks[idx] = 0;
        neighbors.forEach(n => nextActive.add(n));
        continue;
      }
      // --- MEMORY/AGE-BASED RULES: Only allow death if cell has been alive for at least 2 ticks (hysteresis) ---
      this._aliveTicks[idx]++;
      this.age[idx]++;
      let decay = 0.01 * mod;
      if (suppress.includes(this.emotion[idx])) decay *= 1.5;
      if (boost.includes(this.emotion[idx])) decay *= 0.6;
      this.intensity[idx] = Math.max(0.1, this.intensity[idx] - decay);
      this.energy[idx] -= 0.2;
      if ((this.age[idx] > this.maxAge || this.energy[idx] <= 0) && this._aliveTicks[idx] >= 2) {
        this.state[idx] = 0;
        this._deadTicks[idx] = 1; // start dead counter ON DEATH
        this._aliveTicks[idx] = 0;
        neighbors.forEach(n => nextActive.add(n));
      } else {
        nextActive.add(idx);
        neighbors.forEach(n => nextActive.add(n));
      }
    }
    this.active = nextActive;
    this.tick++;
  }

  getStats() {
    const counts = {};
    let total = 0;
    for (let i = 0; i < this.size; i++) {
      if (this.state[i]) {
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

  // Batch draw: fill an ImageData buffer and return it
  getImageData(cellSize = 5) {
    // cellSize: how many pixels per cell
    const width = this.cols * cellSize;
    const height = this.rows * cellSize;
    const imageData = new ImageData(width, height);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = this.index(x, y);
        if (this.state[idx]) {
          const [r, g, b] = EMOTIONS[this.emotion[idx]].color;
          const fade = this.intensity[idx] * 1.5;
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