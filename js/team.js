
import { saveBlocks } from './storage.js';

// team.js — simple team registry and block assignment

let team = [];

export function loadTeam() {
  try {
    const raw = localStorage.getItem('team');
    team = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  } catch (e) {
    team = [];
  }
  // Minimal default palette if empty
  if (team.length === 0) {
    team = [
      { id: 'u_alice', name: 'Alice', color: '#377eb8' },
      { id: 'u_bob', name: 'Bob', color: '#e41a1c' }
    ];
    saveTeam();
  }
  return team;
}

export function saveTeam() {
  localStorage.setItem('team', JSON.stringify(team));
}

export function getTeam() {
  return team;
}

export function getMember(memberId) {
  return getTeam().find(u => u.id === memberId) || null;
}

export function addMember(name, color) {
  const id = `u_${Math.random().toString(36).slice(2,8)}`;
  const m = { id, name: name || 'Membre', color: color || '#377eb8' };
  team.push(m);
  saveTeam();
  return m;
}

export function setMemberColor(memberId, color) {
  const m = getMember(memberId);
  if (m) { m.color = color; saveTeam(); }
}

export function assignBlockToMember(blockData, memberId) {
  /*__INHERIT_CHILDREN__*/
  blockData.assignedTo = memberId || null;
  // Also mirror into DOM if available
  const el = document.getElementById(blockData.id);
  if (el) {
    applyOwnerStyling(blockData, el);
    // update chip text if present
    const chip = el.querySelector('.owner-chip');
    if (chip) {
      const m = getMember(blockData.assignedTo);
      chip.querySelector('.owner-name').textContent = m ? m.name : 'Non assigné';
    
  // Propagate to direct children that are currently unassigned
  try {
    const el2 = document.getElementById(blockData.id);
    const pdata = el2 && el2.__data;
    if (pdata && Array.isArray(pdata.tasks)) {
      pdata.tasks.forEach(t => {
        const cid = t && t.linkedBlockId;
        if (!cid) return;
        const childEl = document.getElementById(cid);
        if (!childEl) return;
        const cdata = childEl.__data || {};
        if (cdata.assignedTo == null) {
          cdata.assignedTo = blockData.assignedTo || null;
          childEl.__data = cdata;
          childEl.dataset.info = JSON.stringify(cdata);
          applyOwnerStyling(cdata, childEl);
          const chip2 = childEl.querySelector('.owner-chip');
          if (chip2) {
            const m2 = getMember(cdata.assignedTo);
            chip2.querySelector('.owner-name').textContent = m2 ? m2.name : 'Non assigné';
          }
        }
      });
    }
  } catch (e) { /* no-op */ }
  saveBlocks();

}
  }
  // Propagate to direct children that are unassigned
  try {
    const el = document.getElementById(blockData.id);
    const pdata = el && el.__data;
    if (pdata && Array.isArray(pdata.tasks)) {
      pdata.tasks.forEach(t => {
        const cid = t && t.linkedBlockId;
        if (!cid) return;
        const childEl = document.getElementById(cid);
        if (!childEl || !childEl.__data) return;
        if (childEl.__data.assignedTo == null) {
          childEl.__data.assignedTo = blockData.assignedTo || null;
          childEl.dataset.info = JSON.stringify(childEl.__data);
          applyOwnerStyling(childEl.__data, childEl);
          const chip2 = childEl.querySelector('.owner-chip .owner-name');
          if (chip2) {
            const m2 = getMember(childEl.__data.assignedTo);
            chip2.textContent = m2 ? m2.name : 'Non assigné';
          }
        }
      });
      saveBlocks();
    }
  } catch (e) { /* silent */ }
}

export function applyOwnerStyling(blockData, el) {
  const target = el || document.getElementById(blockData.id);
  if (!target) return;
  const m = getMember(blockData.assignedTo);
  const color = m ? m.color : '#d0d7de';
  target.style.setProperty('--owner-color', color);
  applyOwnerWeakColor(target, color); // Création d'une variante pale
  if (m) {
    target.dataset.owner = m.id;
    target.classList.remove('owner-unassigned');
  } else {
    target.dataset.owner = '';
    target.classList.add('owner-unassigned');
  }
}

export function applyOwnerWeakColor(el, color) {
  // Utilitaire pour éclaircir une couleur hex
  function lightenColor(hex, percent) {
    let r = 0, g = 0, b = 0;
    if (hex.startsWith('#')) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        r = parseInt(hex[0]+hex[0], 16);
        g = parseInt(hex[1]+hex[1], 16);
        b = parseInt(hex[2]+hex[2], 16);
      } else {
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);
      }
    }
    r = Math.round(r + (255 - r) * percent);
    g = Math.round(g + (255 - g) * percent);
    b = Math.round(b + (255 - b) * percent);
    return `rgb(${r},${g},${b})`;
  }
  const pale = lightenColor(color, 0.9); // XX% plus pâle
  el.style.setProperty('--owner-color-weak', pale);
}


//SUPPRIMER UN MEMBRE
export function removeMember(memberId) {
  if (!memberId) return;

  // 1) Retirer du tableau en mémoire
  const before = getTeam().length;
  const idx = getTeam().findIndex(u => u.id === memberId);
  if (idx === -1) return;

  // on clone pour éviter des surprises si team est referencé
  const updated = [...getTeam()];
  updated.splice(idx, 1);

  // 2) Persister l’équipe
  localStorage.setItem('team', JSON.stringify(updated));

  // 3) Désassigner tous les blocs qui pointaient vers ce membre
  const blocks = JSON.parse(localStorage.getItem('blocks') || '[]').map(b => {
    if (b.assignedTo === memberId) {
      return { ...b, assignedTo: null };
    }
    return b;
  });
  localStorage.setItem('blocks', JSON.stringify(blocks));

  // 4) Mettre à jour le DOM en cours (si présent)
  blocks.forEach(b => {
    const el = document.getElementById(b.id);
    if (el) {
      // met à jour les données mémoire/DOM
      el.__data = { ...(el.__data || {}), assignedTo: b.assignedTo };
      el.dataset.info = JSON.stringify(el.__data);

      // réapplique le style d’owner et texte de la pastille
      applyOwnerStyling(b, el);
      const chip = el.querySelector('.owner-chip');
      if (chip) {
        const nameSpan = chip.querySelector('.owner-name');
        if (nameSpan) nameSpan.textContent = b.assignedTo ? (getMember(b.assignedTo)?.name || 'Non assigné') : 'Non assigné';
      }
    }
  });
}