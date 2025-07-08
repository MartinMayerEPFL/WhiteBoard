let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let startX, startY;

// Transformation actuelle exposée
let currentTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0
};

export function setupViewport() {
  const viewport = document.getElementById('viewport');
  const whiteboard = document.getElementById('whiteboard');
  const connections = document.getElementById('connections');

  function applyTransform() {
    const transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    whiteboard.style.transform = transform;

    // Les courbes ne sont pas transformées pour rester fixes à l'écran
    connections.style.transform = 'none';

    // Mettre à jour l'état global pour d'autres modules
    currentTransform.scale = scale;
    currentTransform.translateX = offsetX;
    currentTransform.translateY = offsetY;
  }

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();

    const zoomFactor = 1.02;
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const prevScale = scale;
    scale *= e.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
    scale = Math.max(0.2, Math.min(scale, 3));

    // Zoom centré sur la souris
    offsetX = mouseX - ((mouseX - offsetX) * (scale / prevScale));
    offsetY = mouseY - ((mouseY - offsetY) * (scale / prevScale));

    applyTransform();
    window.drawConnections?.();
  }, { passive: false });

  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 1 && !(e.button === 0 && e.shiftKey)) return;
    isPanning = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    applyTransform();
    window.drawConnections?.();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
  });
}

// ✅ Permet à d'autres modules (comme connections.js ou ui.js) de récupérer l’état de transformation
export function getViewportTransform() {
  return currentTransform;
}
