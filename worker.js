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
  const { type, opts, x, y, updates, mutationChance, count, rate } = e.data;
  switch (type) {
    case 'init':
      universe = new DorianUniverseOptimized(opts);
      cellSize = opts.cellSize || cellSize;
      if (typeof opts.agentCount === 'number') {
        universe.setAgentCount(opts.agentCount);
      }
      if (typeof opts.reproductionRate === 'number') {
        universe.setReproductionRate(opts.reproductionRate);
      }
      break;
    case 'seed':
      if (universe) universe.seed(x, y);
      break;
    case 'update':
      if (universe && typeof updates === 'number') {
        // Do the update(s)
        for (let i = 0; i < updates; i++) {
          universe.update();
        }
        const imageData = universe.getImageData(cellSize);
        const stats = universe.getStats();
        self.postMessage({ type: 'frame', imageData, stats }, [imageData.data.buffer]);
      }
      break;
    case 'setMutation':
      if (universe && typeof mutationChance === 'number') {
        universe.setMutationChance(mutationChance);
      }
      break;
    case 'setAgentCount':
      if (universe && typeof count === 'number') {
        universe.setAgentCount(count);
      }
      break;
    case 'setReproductionRate':
      if (universe && typeof rate === 'number') {
        universe.setReproductionRate(rate);
      }
      break;
  }
};
