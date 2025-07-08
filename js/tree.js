// tree.js
import { loadBlocks } from './storage.js';

// Retourne tous les blocs sauvegardés
function getAllBlocks() {
  return loadBlocks();
}

// Récupère les enfants d’un bloc via les tâches liées
function getChildBlocks(parentId) {
  const allBlocks = getAllBlocks();
  return allBlocks.filter(block =>
    block.tasks.some(task => task.linkedFrom?.blockId === parentId)
  );
}

// Calcule récursivement la complétion d’un bloc
export function getBlockCompletion(blockData) {
  if (!blockData || !Array.isArray(blockData.tasks)) return 0;

  let total = 0;
  let count = 0;

  for (const task of blockData.tasks) {
    if (task.linkedBlockId) {
      const child = getAllBlocks().find(b => b.id === task.linkedBlockId);
      if (child) {
        total += getBlockCompletion(child);
        count++;
      }
    } else {
      total += task.done ? 100 : 0;
      count++;
    }
  }

  return count === 0 ? 0 : Math.round(total / count);
}

// Met à jour l’affichage de tous les blocs visibles
export function updateAllCompletions() {
  document.querySelectorAll('.block').forEach(block => {
    const data = block.__data;
    const display = block.querySelector('.completion-display');
    if (data && display) {
      const percent = getBlockCompletion(data);
      display.textContent = `✔ ${percent}%`;
    }
  });
}