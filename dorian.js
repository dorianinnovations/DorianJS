// === DorianJS: Full Conversion of Dorian-V2.2.py ===

import { EMOTIONS, EMOTION_ID_TO_NAME, EMOTION_LIST, getZone, terrainZones } from './emotions.js';

const canvas = document.getElementById("dorian-canvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const COLS = 200;
const ROWS = 200;
const CELL_SIZE = WIDTH / COLS;
const MAX_AGE = 800;
const MUTATION_CHANCE = 0.002;
const FPS = 60;

let tick = 0;
let speedModifier = 1;
let recentDeaths = [];

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.state = false;
    this.eid = randomEmotion();
    this.intensity = 0.5;
    this.age = 0;
    this.energy = 10;
    this.memory = [];
  }

  draw() {
    if (this.state) {
      const [r, g, b] = EMOTIONS[this.eid].color;
      const fade = this.intensity * 1.5;
      ctx.fillStyle = `rgb(${Math.min(255, r * fade)}, ${Math.min(255, g * fade)}, ${Math.min(255, b * fade)})`;
      ctx.fillRect(this.x * CELL_SIZE, this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  evaluate(neighbors) {
    const zone = getZone(this.x, this.y);
    const { decay_modifier: mod, boost, suppress } = terrainZones[zone];

    if (!this.state) {
      const live = neighbors.filter(n => n && n.state);
      if ((live.length === 3 || live.length === 4) && Math.random() < 0.25) {
        const chosen = live[Math.floor(Math.random() * live.length)];
        this.state = true;
        this.eid = Math.random() > MUTATION_CHANCE ? chosen.eid : randomEmotion();
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

    this.intensity = Math.max(0.1, this.intensity - decay);
    this.energy -= 0.2;

    if (this.age > MAX_AGE || this.energy <= 0) {
      this.state = false;
      this.memory.push(this.eid);
      this.memory = this.memory.slice(-3);
    }
  }
}

function randomEmotion() {
  return EMOTION_LIST[Math.floor(Math.random() * EMOTION_LIST.length)];
}

const grid = Array.from({ length: COLS }, (_, x) =>
  Array.from({ length: ROWS }, (_, y) => new Cell(x, y))
);

function getNeighbors(grid, x, y) {
  const dirs = [-1, 0, 1];
  return dirs.flatMap(dx =>
    dirs.map(dy => {
      const nx = x + dx, ny = y + dy;
      return (dx === 0 && dy === 0) || nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS ? null : grid[nx][ny];
    })
  ).filter(Boolean);
}

function seed(cx, cy) {
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      const x = cx + dx, y = cy + dy;
      if (x >= 0 && y >= 0 && x < COLS && y < ROWS) {
        const c = grid[x][y];
        c.state = true;
        c.intensity = 1.0;
        c.energy = 10;
        c.age = 0;
        c.eid = randomEmotion();
      }
    }
  }
}

function update() {
  for (let row of grid) {
    for (let cell of row) {
      cell.evaluate(getNeighbors(grid, cell.x, cell.y));
    }
  }
}

function draw() {
  ctx.fillStyle = "rgb(5, 5, 5)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let row of grid) for (let cell of row) cell.draw();
}

function animate() {
  tick++;
  update();
  draw();
  requestAnimationFrame(animate);
}

seed(COLS >> 1, ROWS >> 1);
animate();
