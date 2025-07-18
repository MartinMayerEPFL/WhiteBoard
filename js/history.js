const undoStack = [];

export function pushToHistory(blocks) {
  // On enregistre une copie profonde de l'état actuel
  const snapshot = JSON.stringify(blocks);
  undoStack.push(snapshot);

  // Limite (facultatif)
  if (undoStack.length > 50) undoStack.shift();
}

export function undoLastChange() {
  if (undoStack.length < 2) return null; // pas d’historique utile
  console.log('UNDO triggered');

  undoStack.pop(); // on enlève l'état actuel
  const previous = undoStack[undoStack.length - 1];
  return JSON.parse(previous); // on retourne le précédent
}
