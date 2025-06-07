import { DorianUniverseOptimized } from './dorianUniverseOptimized.js';

let universe = null;
let cellSize = 5;

self.onmessage = (e) => {
  const { type, opts, x, y, updates } = e.data;
  switch (type) {
    case 'init':
      universe = new DorianUniverseOptimized(opts);
      cellSize = opts.cellSize || cellSize;
      break;
    case 'seed':
      if (universe) universe.seed(x, y);
      break;
    case 'update':
      if (universe) {
        const count = updates || 1;
        for (let i = 0; i < count; i++) {
          universe.update();
        }
        const imageData = universe.getImageData(cellSize);
        const stats = universe.getStats();
        self.postMessage({ type: 'frame', imageData, stats }, [imageData.data.buffer]);
      }
      break;
  }
};
