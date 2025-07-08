import { setupWhiteboardUI } from './ui.js';
import { createBlock } from './block.js';
import { loadBlocks } from './storage.js';
import { drawConnections } from './connections.js';
import { setupViewport, getViewportTransform } from './viewport.js';

// Global
window.drawConnections = drawConnections;
window.createBlock = createBlock;
window.getViewportTransform = getViewportTransform; // Utile pour corriger coordonnées dans drawConnections()

// Interface et zoom/pan
setupWhiteboardUI();
setupViewport();

// Charge les blocs existants depuis le stockage
const savedBlocks = loadBlocks();
const createdBlocks = [];

savedBlocks.forEach(data => {
  const block = createBlock(data);
  createdBlocks.push(block);
});
// Redessiner les connexions après rendu
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    console.log('Blocs chargés:', savedBlocks);
    console.log('Exemple de tâche:', savedBlocks[0]?.tasks?.[0]);
    drawConnections();
    window.updateAllCompletions?.();
  });
});

