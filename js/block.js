import { renderAllTasks } from './tasks.js';
import { saveBlocks } from './storage.js';
import { getViewportTransform } from './viewport.js';

export function createBlock(data = {}) {
  const whiteboard = document.getElementById('whiteboard');
  const block = document.createElement('div');

  block.dataset.id = data.id || crypto.randomUUID();
  data.id = block.dataset.id;
  block.__data = data;
  block.dataset.info = JSON.stringify(data); // 🔴 ceci est crucial pour les courbes

  block.classList.add('block');
  block.style.position = 'absolute';

  const x = data.x || 100;
  const y = data.y || 100;
  block.style.left = `${x}px`;
  block.style.top = `${y}px`;
  block.style.width = (data.width || 400) + 'px';
  block.style.height = (data.height || 'auto') + 'px';

  const title = document.createElement('div');
  title.classList.add('title');
  title.contentEditable = true;
  title.textContent = data.title || 'Titre';
  block.appendChild(title);

  const tasksContainer = document.createElement('div');
  tasksContainer.classList.add('tasks');
  block.appendChild(tasksContainer);

  const completionDisplay = document.createElement('div');
  completionDisplay.classList.add('completion-display');
  block.appendChild(completionDisplay);

  const resizeCorner = document.createElement('div');
  resizeCorner.className = 'resize-corner';
  block.appendChild(resizeCorner);

  const addTask = document.createElement('div');
  addTask.classList.add('add-task');
  addTask.textContent = '+ Ajouter une tâche';
  addTask.onclick = () => {
    data.tasks.push({ text: 'Nouvelle tâche', done: false, selected: false });
    renderAllTasks(tasksContainer, completionDisplay, data);
    saveBlocks();
  };
  block.appendChild(addTask);

  block.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.block').forEach(b => b.classList.remove('selected'));
    block.classList.add('selected');
  });

  whiteboard.appendChild(block);

  interact(block).draggable({
    listeners: {
      start() {
        block.classList.add('dragging');
      },
      move(event) {
        const { scale } = getViewportTransform();
        const left = parseFloat(block.style.left) || 0;
        const top = parseFloat(block.style.top) || 0;
        block.style.left = `${left + event.dx / scale}px`;
        block.style.top = `${top + event.dy / scale}px`;

        drawConnections();
        saveBlocks();
      },
      end() {
        block.classList.remove('dragging');
        window.drawConnections?.();
        window.updateAllCompletions?.();
        saveBlocks();
      }
    }
  });

  // Redimensionnement uniquement depuis le coin bas droit
  interact(resizeCorner).draggable({
    listeners: {
      move(event) {
        const minHeight = parseFloat(block.dataset.minHeight) || 100;
        const width = parseFloat(block.style.width) || 400;
        const height = parseFloat(block.style.height) || 200;

        const newWidth = width + event.dx;
        const newHeight = Math.max(height + event.dy, minHeight);

        block.style.width = `${newWidth}px`;
        block.style.height = `${newHeight}px`;

        drawConnections();
        saveBlocks();
      },
      end() {
        window.drawConnections?.();
        window.updateAllCompletions?.();
        saveBlocks();
      }
    }
  });

  title.addEventListener('input', saveBlocks);
  tasksContainer.addEventListener('input', saveBlocks);
  addTask.addEventListener('click', saveBlocks);

  if (data.tasks) {
    renderAllTasks(tasksContainer, completionDisplay, data);
  }

  requestAnimationFrame(() => {
    block.__data = data;
    block.dataset.info = JSON.stringify(data);
    window.drawConnections?.();
  });

  return block;
}

window.createBlock = createBlock;
