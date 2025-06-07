const CELL_SIZE = 5; // px per cell

// Fixed canvas size
const canvas = document.getElementById("dorian-canvas");
canvas.width = 1000;
canvas.height = 1000;
const ctx = canvas.getContext("2d");

const COLS = 200;
const ROWS = 200;
const MAX_AGE = 800;
const MUTATION_CHANCE = 0.002;
let UPDATES_PER_FRAME = 1;

let running = false;
let hasStarted = false;
let lastAlive = 0;
let worker;

function initWorker() {
  if (worker) worker.terminate();
  worker = new Worker('worker.js', { type: 'module' });
  worker.onmessage = ({ data }) => {
    if (data.type === 'frame') {
      const img = new ImageData(new Uint8ClampedArray(data.imageData.data), data.imageData.width, data.imageData.height);
      ctx.putImageData(img, 0, 0);
      updateHUD(data.stats);
      if (running) requestAnimationFrame(animate);
    }
  };
  worker.postMessage({ type: 'init', opts: { cols: COLS, rows: ROWS, maxAge: MAX_AGE, mutationChance: MUTATION_CHANCE, cellSize: CELL_SIZE } });
}

initWorker();

document.getElementById('tick').textContent = 'Click the canvas to begin!';

const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const pauseBtn = document.getElementById('pause-btn');
const mutationToggle = document.getElementById('toggle-mutation');
const resetBtn = document.getElementById('reset-btn');

mutationToggle.addEventListener('change', () => {
  const chance = mutationToggle.checked ? MUTATION_CHANCE : 0;
  if (worker) {
    worker.postMessage({ type: 'setMutation', mutationChance: chance });
  }
});

speedSlider.max = '10';
speedSlider.addEventListener('input', () => {
  if (parseInt(speedSlider.value) > 10) speedSlider.value = '10';
  UPDATES_PER_FRAME = parseInt(speedSlider.value);
  speedValue.textContent = speedSlider.value;
});
if (parseInt(speedSlider.value) > 10) speedSlider.value = '10';
UPDATES_PER_FRAME = parseInt(speedSlider.value);
speedValue.textContent = speedSlider.value;

pauseBtn.addEventListener('click', () => {
  running = !running;
  pauseBtn.textContent = running ? 'Pause' : 'Resume';
  if (running) animate();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    running = !running;
    pauseBtn.textContent = running ? 'Pause' : 'Resume';
    if (running) animate();
    e.preventDefault();
  }
});

resetBtn.addEventListener('click', () => {
  initWorker();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lastAlive = 0;
  hasStarted = false;
  running = false;
  document.getElementById('tick').textContent = 'Click the canvas to begin!';
  pauseBtn.textContent = 'Pause';
});

function updateCanvasBorderEmotion(dominant) {
  const emotion = dominant.toLowerCase();
  const classes = [
    'dominant-emotion-joy',
    'dominant-emotion-trust',
    'dominant-emotion-fear',
    'dominant-emotion-surprise',
    'dominant-emotion-sadness',
    'dominant-emotion-disgust',
    'dominant-emotion-anger',
    'dominant-emotion-anticipation'
  ];
  canvas.classList.remove(...classes);
  if (classes.includes('dominant-emotion-' + emotion)) {
    canvas.classList.add('dominant-emotion-' + emotion);
  }
}

function updateHUD(stats) {
  const alive = stats.alive;
  const growth = alive - lastAlive;
  lastAlive = alive;

  document.getElementById('tick').textContent = `Tick: ${stats.tick}`;
  document.getElementById('dominant').textContent = `Current Emotional State: ${stats.dominant}`;
  document.getElementById('diversity').textContent = `Diversity: ${stats.diversity}`;
  document.getElementById('entropy').textContent = `Entropy: ${stats.entropy}`;
  document.getElementById('alive').textContent = `Alive: ${alive}`;
  document.getElementById('growth').textContent = `Growth: ${growth}`;
  updateCanvasBorderEmotion(stats.dominant);
}

function animate() {
  if (!running) return;
  worker.postMessage({ type: 'update', updates: UPDATES_PER_FRAME });
}

canvas.addEventListener('mousedown', (e) => {
  if (!running && hasStarted) {
    canvas.classList.add('seed-denied');
    setTimeout(() => canvas.classList.remove('seed-denied'), 500);
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  worker.postMessage({ type: 'seed', x, y });
  if (!hasStarted) {
    hasStarted = true;
    running = true;
    animate();
  }
});

const hideUiBtn = document.getElementById('hide-ui-btn');
const uiPanel = document.getElementById('ui');
hideUiBtn.addEventListener('click', () => {
  uiPanel.classList.toggle('hide-ui');
  if (uiPanel.classList.contains('hide-ui')) {
    hideUiBtn.textContent = '🙈';
    hideUiBtn.title = 'Show UI';
  } else {
    hideUiBtn.textContent = '👁️';
    hideUiBtn.title = 'Hide UI';
  }
});
