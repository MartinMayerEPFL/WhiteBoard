export function loadBlocks() {
  return JSON.parse(localStorage.getItem('blocks')) || [];
}

export function saveBlocks() {
  const saved = [];

  document.querySelectorAll('.block').forEach(block => {
    const x = parseFloat(block.style.left) || 0;
    const y = parseFloat(block.style.top) || 0;
    const width = block.offsetWidth;
    const height = block.offsetHeight;
    const title = block.querySelector('.title')?.textContent || '';
    const blockId = block.dataset.id || null;

    // Récupérer les tâches de data-info si elles existent
    const blockData = JSON.parse(block.dataset.info || '{}');

    const taskItems = block.querySelectorAll('.task-item');
    const tasks = Array.from(taskItems).map((item, index) => {
      const text = item.querySelector('.task-text')?.textContent || '';
      const done = item.querySelector('.task-text')?.classList.contains('done') || false;
      const selected = item.querySelector('.task-buttons .selected') !== null;

      // linkedBlockId (si défini dans blockData)
      const linkedBlockId = blockData.tasks?.[index]?.linkedBlockId || null;

      return { text, done, selected, linkedBlockId };
    });

    saved.push({ x, y, width, height, title, id: blockId, tasks });
  });

  localStorage.setItem('blocks', JSON.stringify(saved));
}