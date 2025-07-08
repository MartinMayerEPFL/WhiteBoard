
import { getViewportTransform } from './viewport.js';

export function drawConnections() {
  const svg = document.getElementById('connections');
  if (!svg) return;
  svg.innerHTML = '';

  const blocks = [...document.querySelectorAll('.block')];
  const viewport = document.getElementById("viewport");
  const vRect = viewport.getBoundingClientRect();

  blocks.forEach(sourceBlock => {
    const sourceData = sourceBlock.__data;
    if (!sourceData?.tasks) return;

    sourceData.tasks.forEach((task, taskIndex) => {
      const targetBlock = blocks.find(b => b.dataset.id === task.linkedBlockId);
      if (!targetBlock) return;

      const sourceTaskItem = sourceBlock.querySelectorAll('.task-item')[taskIndex];
      if (!sourceTaskItem) return;

      const sRect = sourceTaskItem.getBoundingClientRect();
      const tRect = targetBlock.getBoundingClientRect();

      const startX = sRect.right - vRect.left;
      const startY = sRect.top + sRect.height / 2 - vRect.top;
      const endX = tRect.left - vRect.left;
      const endY = tRect.top + tRect.height / 2 - vRect.top;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${startX},${startY} C${startX + 50},${startY} ${endX - 50},${endY} ${endX},${endY}`);
      path.setAttribute('stroke', 'black');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-width', '2');
      svg.appendChild(path);
    });
  });
}

