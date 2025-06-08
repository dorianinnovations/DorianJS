import { DorianUniverseOptimized } from './dorianUniverseOptimized.js';

let universe = null;
let cellSize = 5; // rendered pixel size

let speed = 1; // default speed (user adjustable)
let animationLoopRunning = false;

function startAnimationLoop() {
  if (animationLoopRunning) return;
  animationLoopRunning = true;

  let partialTick = 0;

  function loop() {
    if (!universe) return;

    partialTick += speed * 0.1;

    while (partialTick >= 1) {
      universe.update();
      partialTick--;
    }

    const imageData = universe.getImageData(cellSize);
    const stats = universe.getStats();
    self.postMessage({ type: 'frame', imageData, stats }, [imageData.data.buffer]);

    requestAnimationFrame(loop);
  }

  loop();
}

self.onmessage = (e) => {
  const { type, opts, x, y, updates, mutationChance } = e.data;
  switch (type) {
    case 'init':
      // opts may include birthDelay to control how long cells stay dead before regrowth
      universe = new DorianUniverseOptimized(opts);
      cellSize = opts.cellSize || cellSize;
      break;
    case 'seed':
      if (universe) universe.seed(x, y);
      break;
    case 'update':
      if (typeof updates === 'number') {
        speed = updates;
      }
      startAnimationLoop();
      break;
    case 'setMutation':
      if (universe && typeof mutationChance === 'number') {
        universe.setMutationChance(mutationChance);
      }
      break;
  }
};
