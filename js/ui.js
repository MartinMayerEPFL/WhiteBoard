import { createBlock } from './block.js';
import { saveBlocks } from './storage.js';
import { updateAllCompletions } from './tree.js';

export function setupWhiteboardUI() {
  const whiteboard = document.getElementById('whiteboard');

  // Titre dynamique
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const projectTitle = `ProjectName_${dd}.${mm}.${yyyy}`;


const titleBar = document.createElement('div');
titleBar.id = 'whiteboard-title';
titleBar.style.position = 'relative'; // nécessaire pour positionner les boutons

// Zone de texte du titre
const titleText = document.createElement('div');
titleText.id = 'title-text';
titleText.contentEditable = true;
titleText.textContent = localStorage.getItem('projectTitle') || projectTitle;
titleText.addEventListener('input', () => {
  localStorage.setItem('projectTitle', titleText.textContent.trim());
});
titleBar.appendChild(titleText);

// Conteneur des boutons
const buttonContainer = document.createElement('div');
buttonContainer.className = 'title-button-container';

// Bouton Export JSON
const exportBtn = document.createElement('button');
exportBtn.textContent = '📤 Export JSON';
exportBtn.className = 'title-button';
exportBtn.onclick = () => {
  const data = localStorage.getItem('blocks');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'arborescence.json';
  a.click();
};
buttonContainer.appendChild(exportBtn);

// Bouton Import JSON
const importBtn = document.createElement('button');
importBtn.textContent = '📥 Import JSON';
importBtn.className = 'title-button';
importBtn.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        localStorage.setItem('blocks', reader.result);
        location.reload();
      } catch (err) {
        alert('Fichier invalide');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};
buttonContainer.appendChild(importBtn);

// Ajout du conteneur à la bannière
titleBar.appendChild(buttonContainer);

// Enfin, ajout de la bannière au whiteboard
titleBar.appendChild(titleText);

buttonContainer.className = 'title-button-container';

buttonContainer.appendChild(importBtn); // Import à gauche
buttonContainer.appendChild(exportBtn); // Export à droite

titleBar.appendChild(buttonContainer);


  // Sauvegarder à chaque modification
  titleBar.addEventListener('input', () => {
    localStorage.setItem('projectTitle', titleBar.textContent.trim());
  });

  whiteboard.appendChild(titleBar);


whiteboard.addEventListener('dblclick', function (e) {
  e.preventDefault();

  const { scale, translateX, translateY } = getViewportTransform();
  const viewportRect = document.getElementById('viewport').getBoundingClientRect();

  const mouseX = e.clientX - viewportRect.left;
  const mouseY = e.clientY - viewportRect.top;

  const x = (mouseX - 25 - translateX) / scale;
  const y = (mouseY - 5 - translateY) / scale;

  const newBlockData = { x, y, title: 'Titre', tasks: [] };
  const newBlock = createBlock(newBlockData);

  const titleField = newBlock.querySelector('.title');
  if (titleField) {
    titleField.focus();

    // facultatif : place le curseur à la fin
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(titleField);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  saveBlocks?.();
  window.updateAllCompletions?.();
});


// Désélection au clic hors bloc
  whiteboard.addEventListener('mousedown', function (e) {
    if (e.target === whiteboard) {
      document.querySelectorAll('.block').forEach(b => b.classList.remove('selected'));
    }
  });

// Suppression via clavier avec mise à jour des connexions
document.addEventListener('keydown', function (e) {
  const active = document.activeElement;
  const isEditing = active && (active.isContentEditable || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

  if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditing) {
    const selected = document.querySelector('.block.selected');
    if (selected) {
      const deletedId = selected.dataset.id;

      // Supprimer les liens pointant vers ce bloc dans toutes les autres tâches
      document.querySelectorAll('.block').forEach(block => {
        const data = block.__data;
        if (!data?.tasks) return;

        data.tasks.forEach(task => {
          if (task.linkedBlockId === deletedId) {
            delete task.linkedBlockId;
          }
        });
      });

      selected.remove();
      saveBlocks();
      drawConnections();
      updateAllCompletions?.();
    }
  }
});

//Désactive le menu clic droit sur le whiteboard
  whiteboard.addEventListener('contextmenu', e => e.preventDefault());
}
