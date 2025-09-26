
// layout.js — manage layout mode and grid snapping/overlay

const KEY = 'layoutMode';
const DEFAULT = 'free';
const GRID_SIZE = 20;

export function getLayoutMode() {
  return localStorage.getItem(KEY) || DEFAULT;
}
export function isGrid() {
  return getLayoutMode() === 'grid';
}
export function setLayoutMode(mode) {
  localStorage.setItem(KEY, mode === 'grid' ? 'grid' : 'free');
  applyGridOverlay();
  if (mode === 'grid') {
    snapAllBlocks(GRID_SIZE);
  }
}

export function applyGridOverlay() {
  const wb = document.getElementById('whiteboard');
  if (!wb) return;
  wb.classList.toggle('grid-on', isGrid());
}

export function snapValue(val, size = GRID_SIZE) {
  return Math.round(val / size) * size;
}

export function snapAllBlocks(size = GRID_SIZE) {
  document.querySelectorAll('.block').forEach(block => {
    const left = parseFloat(block.style.left) || 0;
    const top = parseFloat(block.style.top) || 0;
    block.style.left = snapValue(left, size) + 'px';
    block.style.top = snapValue(top, size) + 'px';
  });
  // Optional: redraw connections after mass snap
  window.drawConnections?.();
}

// Ensure overlay applied on load
document.addEventListener('DOMContentLoaded', applyGridOverlay);
