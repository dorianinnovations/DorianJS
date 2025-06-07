// === dorianUniverse.js ===
import { EMOTIONS, EMOTION_ID_TO_NAME, EMOTION_LIST, getZone, terrainZones } from './emotions.js';

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.state = false;
    this.eid = DorianUniverse.randomEmotion();
    this.intensity = 0.5;
    this.age = 0;
    this.energy = 10;
    this.memory = [];
  }

  evaluate(neighbors, universe) {
    const zone = getZone(this.x, this.y);
    const { decay_modifier: mod, boost, suppress } = terrainZones[zone];
    // --- Emotion-to-zone preference mapping ---
    const emotionZonePreference = {
      0: 'desert',        // Joy prefers desert
      1: 'forest',        // Trust prefers forest
      2: 'ocean',         // Fear prefers ocean
      3: 'mountain',      // Surprise prefers mountain
      4: 'ocean',         // Sadness prefers ocean
      5: 'valley',        // Disgust prefers valley
      6: 'mountain',      // Anger prefers mountain
      7: 'desert'         // Anticipation prefers desert
    };

    if (!this.state) {
      const live = neighbors.filter(n => n && n.state);
      let birthChance = 0.25;
      if (live.length > 0) {
        // Find most common neighbor emotion
        const emotionCounts = {};
        for (const n of live) {
          emotionCounts[n.eid] = (emotionCounts[n.eid] || 0) + 1;
        }
        const maxEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
        if (emotionZonePreference[maxEmotion] === zone) {
          birthChance *= 1.7;
        } else {
          birthChance *= 0.7;
        }
      }
      if ((live.length === 3 || live.length === 4) && Math.random() < birthChance) {
        const chosen = live[Math.floor(Math.random() * live.length)];
        this.state = true;
        this.eid = Math.random() > universe.mutationChance ? chosen.eid : DorianUniverse.randomEmotion();
        this.intensity = 1.0;
        this.energy = 10;
        this.age = 0;
      }
      return;
    }

    this.age++;
    let decay = 0.01 * mod;
    if (suppress.includes(this.eid)) decay *= 1.5;
    if (boost.includes(this.eid)) decay *= 0.6;
    // Zone preference: boost survival if in preferred zone
    if (emotionZonePreference[this.eid] === zone) {
      decay *= 0.6;
    } else {
      decay *= 1.4;
    }

    this.intensity = Math.max(0.1, this.intensity - decay);
    this.energy -= 0.2;

    if (this.age > universe.maxAge || this.energy <= 0) {
      this.state = false;
      this.memory.push(this.eid);
      this.memory = this.memory.slice(-3);
    }
  }
}

export class DorianUniverse {
  constructor({ cols = 200, rows = 200, maxAge = 800, mutationChance = 0.002 } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.maxAge = maxAge;
    this.mutationChance = mutationChance;
    this.grid = Array.from({ length: cols }, (_, x) =>
      Array.from({ length: rows }, (_, y) => new Cell(x, y))
    );
    this.tick = 0;
  }

  static randomEmotion() {
    return EMOTION_LIST[Math.floor(Math.random() * EMOTION_LIST.length)];
  }

  getNeighbors(x, y) {
    const dirs = [-1, 0, 1];
    return dirs.flatMap(dx =>
      dirs.map(dy => {
        const nx = x + dx, ny = y + dy;
        return (dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows ? null : this.grid[nx][ny];
      })
    ).filter(Boolean);
  }

  seed(cx, cy) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && y >= 0 && x < this.cols && y < this.rows) {
          const c = this.grid[x][y];
          c.state = true;
          c.intensity = 1.0;
          c.energy = 10;
          c.age = 0;
          c.eid = DorianUniverse.randomEmotion();
        }
      }
    }
  }

  update() {
    for (let row of this.grid) {
      for (let cell of row) {
        cell.evaluate(this.getNeighbors(cell.x, cell.y), this);
      }
    }
    this.tick++;
  }

  getStats() {
    const counts = {};
    for (let row of this.grid) {
      for (let cell of row) {
        if (cell.state) {
          counts[cell.eid] = (counts[cell.eid] || 0) + 1;
        }
      }
    }
    let dominant = "None";
    let max = 0;
    let total = 0;
    for (let eid in counts) {
      total += counts[eid];
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
      entropy
    };
  }
}