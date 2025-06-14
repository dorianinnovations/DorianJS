import fs from 'fs';

const memoryPath = './dorian_memory.json';

export function loadMemory() {
  if (!fs.existsSync(memoryPath)) {
    const initial = {
      meta: { currentTick: 0, createdAt: new Date().toISOString() },
      emotionLog: [],
      beliefs: [],
      namedPhases: []
    };
    fs.writeFileSync(memoryPath, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
}

export function saveMemory(memory) {
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
}
