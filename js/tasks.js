import { saveBlocks } from './storage.js';
import { drawConnections } from './connections.js';
import { createBlock } from './block.js';
import { getBlockCompletion, updateAllCompletions } from './tree.js';

export function renderAllTasks(tasksContainer, completionDisplay, data) {
  tasksContainer.innerHTML = '';

  data.tasks.forEach((task, i) => {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    const text = document.createElement('div');
    text.classList.add('task-text');
    text.textContent = task.text;
    if (!task.done) text.contentEditable = true;
    if (task.done) text.classList.add('done');

    const buttons = document.createElement('div');
    buttons.classList.add('task-buttons');

    // ✔️
    if (!task.done) {
      const doneBtn = document.createElement('button');
      doneBtn.textContent = '✔️';
      doneBtn.onclick = () => {
        task.done = true;
        renderAllTasks(tasksContainer, completionDisplay, data);
        saveBlocks();
        updateAllCompletions(); 
      };
      buttons.appendChild(doneBtn);
    }

    // ❌
    if (task.done) {
      const undoBtn = document.createElement('button');
      undoBtn.textContent = '❌';
      undoBtn.onclick = () => {
        task.done = false;
        renderAllTasks(tasksContainer, completionDisplay, data);
        saveBlocks();
        updateAllCompletions(); 
      };
      buttons.appendChild(undoBtn);
    }


    // 🗑️
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = () => {
      if (confirm('Supprimer cette tâche ?')) {
        data.tasks.splice(i, 1);
        renderAllTasks(tasksContainer, completionDisplay, data);
        saveBlocks();
        updateAllCompletions(); 
      }
    };
    buttons.appendChild(deleteBtn);

    // + Créer un bloc enfant
    //const linkBtn = document.createElement('button');
    //linkBtn.textContent = '⚫';

    const linkBtn = document.createElement('button');
    linkBtn.className = 'custom-link-button';
    linkBtn.title = 'Ajouter un bloc enfant';
    linkBtn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-width="1.5" d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"></path>
        <path stroke-width="1.5" d="M8 12H16"></path>
        <path stroke-width="1.5" d="M12 16V8"></path>
      </svg>
    `;

linkBtn.onclick = () => {
  if (task.linkedBlockId) return;

  const parentBlock = taskItem.closest('.block');
  const parentId = parentBlock?.dataset.id;
  if (!parentBlock || !parentId) return;

  const newId = crypto.randomUUID();

  const whiteboardRect = document.getElementById('whiteboard').getBoundingClientRect();
  const { scale, translateX, translateY } = getViewportTransform();

  const mouseX = event.clientX - whiteboardRect.left;
  const mouseY = event.clientY - whiteboardRect.top;

  const initialX = (mouseX - translateX) / scale;
  const initialY = (mouseY - translateY) / scale;

  const offsetFromMouseX = 100; // moitié largeur du bloc
  const offsetFromMouseY = 30;  // hauteur approximative du titre

  const ghostBlockData = {
    id: newId,
    x: initialX - offsetFromMouseX,
    y: initialY - offsetFromMouseY,
    title: task.text,
    tasks: [],
  };


  const ghost = createBlock(ghostBlockData);
  ghost.classList.add('ghost-dragging');
  task.linkedBlockId = newId;
  parentBlock.__data = data;
  parentBlock.dataset.info = JSON.stringify(data);

function moveGhost(e) {
  const viewportRect = document.getElementById('viewport').getBoundingClientRect();
  const { scale, translateX, translateY } = getViewportTransform();
  const mouseX = e.clientX - viewportRect.left;
  const mouseY = e.clientY - viewportRect.top;
  const x = (mouseX - translateX) / scale;
  const y = (mouseY - translateY) / scale;
  ghost.style.left = `${x - offsetFromMouseX}px`;
  ghost.style.top = `${y - offsetFromMouseY}px`;

  drawConnections();
}

  document.addEventListener('mousemove', moveGhost);

 function dropBlock(e) {
  if (e.button === 0) { // clic gauche
    e.preventDefault();
    document.removeEventListener('mousemove', moveGhost);
    document.removeEventListener('mousedown', dropBlock);
    ghost.classList.remove('ghost-dragging');

    // Fixer la position finale
    ghost.style.transform = 'none';
    ghost.style.left = `${posX}px`;
    ghost.style.top = `${posY}px`;

    // Présélection du champ titre
    const titleField = ghost.querySelector('.title');
    if (titleField) {
      titleField.focus();
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(titleField);
      selection.removeAllRanges();
      selection.addRange(range);
    });
    }

    // Mise à jour des données et sauvegarde
    task.linkedBlockId = newId;
    parentBlock.__data = data;
    parentBlock.dataset.info = JSON.stringify(data);

    saveBlocks();
    drawConnections();
    updateAllCompletions?.();
  }
}

  document.addEventListener('mousedown', dropBlock);
};

  buttons.appendChild(linkBtn);

    text.addEventListener('input', () => {
      task.text = text.textContent;
      saveBlocks();
      drawConnections();
      updateAllCompletions(); 
    });

    taskItem.appendChild(text);
    taskItem.appendChild(buttons);
    tasksContainer.appendChild(taskItem);
  });

  const percent = getBlockCompletion(data);
  completionDisplay.textContent = `✔ ${percent}%`;
  updateAllCompletions();  // recalcule tous les blocs
}