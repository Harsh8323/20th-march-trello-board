if (!requireAuth()) {
  window.location.href = 'auth.html';
}

const params = new URLSearchParams(window.location.search);
const orgId = parseInt(params.get('orgId'));
const boardId = parseInt(params.get('boardId'));

if (!orgId || !boardId) {
  window.location.href = 'dashboard.html';
}

let issues = [];

const goBack = (e) => {
  e.preventDefault();
  window.location.href = `organization.html?id=${orgId}`;
};

const loadData = async () => {
  try {
    const data = await api.getIssues(boardId);
    issues = data.issues || [];
    renderBoard();
  } catch (err) {
    showToast('Failed to load issues');
  }
};

const renderBoard = () => {
  document.getElementById('board-title').textContent = `Board #${boardId}`;

  const columns = {
    TODO: issues.filter(i => i.status === 'TODO'),
    IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS'),
    DONE: issues.filter(i => i.status === 'DONE')
  };

  Object.keys(columns).forEach(status => {
    const container = document.getElementById(`column-${status.toLowerCase().replace('_', '-')}`);
    container.innerHTML = '';

    columns[status].forEach(issue => {
      const card = document.createElement('div');
      card.className = 'issue-card';
      card.innerHTML = `
        <h4>${issue.title}</h4>
        ${issue.description ? `<p class="issue-desc">${issue.description}</p>` : ''}
        <p class="assignee">${issue.assignee ? issue.assignee.username : 'Unassigned'}</p>
        <div class="issue-actions">
          <button class="btn btn-small btn-secondary" onclick="showEditIssueModal(${issue.id})">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteIssue(${issue.id})">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  });

  document.querySelectorAll('.column-count').forEach(el => {
    const status = el.dataset.status;
    el.textContent = columns[status].length;
  });
};

const showCreateIssueModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>Create Issue</h2>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="input" id="issue-title" placeholder="Issue title">
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="input" id="issue-desc" placeholder="Short description">
      </div>
      <div class="form-group">
        <label>Assignee (optional)</label>
        <input type="text" class="input" id="issue-assignee" placeholder="Username">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="createIssue()">Create</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('issue-title').focus();

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
};

const createIssue = async () => {
  const title = document.getElementById('issue-title').value.trim();
  const description = document.getElementById('issue-desc').value.trim();
  const assignee = document.getElementById('issue-assignee').value.trim();

  if (!title) {
    showToast('Title is required');
    return;
  }

  try {
    await api.createIssue(boardId, title, description, assignee || null);
    document.querySelector('.modal-overlay').remove();
    showToast('Issue created');
    loadData();
  } catch (err) {
    showToast(err.message);
  }
};

const showEditIssueModal = (issueId) => {
  const issue = issues.find(i => i.id === issueId);
  if (!issue) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>Edit Issue</h2>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="input" id="edit-issue-title" value="${issue.title}">
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="input" id="edit-issue-desc" value="${issue.description || ''}" placeholder="Description">
      </div>
      <div class="form-group">
        <label>Status</label>
        <select class="input" id="edit-issue-status">
          <option value="TODO" ${issue.status === 'TODO' ? 'selected' : ''}>TODO</option>
          <option value="IN_PROGRESS" ${issue.status === 'IN_PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
          <option value="DONE" ${issue.status === 'DONE' ? 'selected' : ''}>DONE</option>
        </select>
      </div>
      <div class="form-group">
        <label>Assignee (optional)</label>
        <input type="text" class="input" id="edit-issue-assignee" value="${issue.assignee ? issue.assignee.username : ''}" placeholder="Username">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="updateIssue(${issueId})">Update</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
};

const updateIssue = async (issueId) => {
  const title = document.getElementById('edit-issue-title').value.trim();
  const description = document.getElementById('edit-issue-desc').value.trim();
  const status = document.getElementById('edit-issue-status').value;
  const assignee = document.getElementById('edit-issue-assignee').value.trim();

  if (!title) {
    showToast('Title is required');
    return;
  }

  try {
    await api.updateIssue(issueId, title, description, status, assignee || null);
    document.querySelector('.modal-overlay').remove();
    showToast('Issue updated');
    loadData();
  } catch (err) {
    showToast(err.message);
  }
};

const deleteIssue = async (issueId) => {
  try {
    await api.deleteIssue(issueId);
    showToast('Issue deleted');
    loadData();
  } catch (err) {
    showToast(err.message);
  }
};

document.addEventListener('DOMContentLoaded', loadData);
