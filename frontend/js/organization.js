if (!requireAuth()) {
  window.location.href = 'auth.html';
}

const params = new URLSearchParams(window.location.search);
const orgId = parseInt(params.get('id'));

if (!orgId) {
  window.location.href = 'dashboard.html';
}

const loadData = async () => {
  try {
    const [orgData, membersData, boardsData] = await Promise.all([
      api.getOrganization(orgId),
      api.getMembers(orgId),
      api.getBoards(orgId)
    ]);

    document.getElementById('org-title').textContent = orgData.organization.title;
    document.getElementById('org-desc').textContent = orgData.organization.description || '';

    renderBoards(boardsData.boards);
    renderMembers(membersData.members);

  } catch (err) {
    showToast('Failed to load data');
  }
};

const renderBoards = (boards) => {
  const container = document.getElementById('boards-container');
  container.innerHTML = '';

  if (boards.length === 0) {
    container.innerHTML = `
      <div class="empty-card">
        <p class="empty-state">No boards yet. Create one to get started.</p>
        <div class="card new-card mt-16" onclick="showCreateBoardModal()">+ New Board</div>
      </div>
    `;
    return;
  }

  boards.forEach(board => {
    const card = document.createElement('div');
    card.className = 'card board-card';
    card.onclick = () => window.location.href = `board.html?orgId=${orgId}&boardId=${board.id}`;
    card.innerHTML = `
      <h3>${board.title}</h3>
      <p class="meta">${board.description || 'No description'}</p>
      <div class="meta">
        <span>Board #${board.id}</span>
        <span>Issues: ${board.issueCount}</span>
      </div>
    `;
    container.appendChild(card);
  });

  const newCard = document.createElement('div');
  newCard.className = 'card board-card new-card';
  newCard.onclick = showCreateBoardModal;
  newCard.textContent = '+ New Board';
  container.appendChild(newCard);
};

const renderMembers = (members) => {
  const container = document.getElementById('members-container');
  container.innerHTML = '';

  if (members.length === 0) {
    container.innerHTML = '<div class="empty-state">No members yet.</div>';
  }

  members.forEach(member => {
    const item = document.createElement('div');
    item.className = 'member-item';
    item.innerHTML = `
      <span>${member.username}</span>
      <button class="btn btn-small btn-danger" onclick="removeMember('${member.username}')">Remove</button>
    `;
    container.appendChild(item);
  });
};

const showCreateBoardModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>Create Board</h2>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="input" id="board-title" placeholder="Board name">
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="input" id="board-desc" placeholder="Short description">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="createBoard()">Create</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('board-title').focus();

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
};

const createBoard = async () => {
  const title = document.getElementById('board-title').value.trim();
  const description = document.getElementById('board-desc').value.trim();

  if (!title) {
    showToast('Title is required');
    return;
  }

  try {
    await api.createBoard(orgId, title, description);
    document.querySelector('.modal-overlay').remove();
    showToast('Board created');
    loadData();
  } catch (err) {
    showToast(err.message);
  }
};

const showAddMemberModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>Add Member</h2>
      <div class="form-group">
        <label>Username</label>
        <input type="text" class="input" id="member-username" placeholder="Enter username">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="addMember()">Add</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('member-username').focus();

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
};

const addMember = async () => {
  const username = document.getElementById('member-username').value.trim();

  if (!username) {
    showToast('Username is required');
    return;
  }

  try {
    await api.addMember(orgId, username);
    document.querySelector('.modal-overlay').remove();
    showToast('Member added');
    loadData();
  } catch (err) {
    showToast(err.message);
  }
};

const removeMember = async (username) => {
  try {
    await api.removeMember(orgId, username);
    showToast('Member removed');
    loadData();
  } catch (err) {
    showToast(err.message);
  }
};

document.addEventListener('DOMContentLoaded', loadData);
