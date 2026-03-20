if (!requireAuth()) {
  window.location.href = 'auth.html';
}

const loadOrganizations = async () => {
  const container = document.getElementById('orgs-container');
  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const orgs = await api.getOrganizations();
    container.innerHTML = '';

    if (orgs.length === 0) {
      container.innerHTML = `
        <div class="empty-card">
          <p class="empty-state">No organizations yet. Create one to get started.</p>
          <div class="card new-card mt-16" onclick="showCreateModal()">+ New Organization</div>
        </div>
      `;
      return;
    }

    orgs.forEach(org => {
      const card = document.createElement('div');
      card.className = 'card org-card';
      card.onclick = () => window.location.href = `organization.html?id=${org.id}`;
      card.innerHTML = `
        <h3>${org.title}</h3>
        <p>${org.description || 'No description'}</p>
        <div class="meta">
          <span>ID: ${org.id}</span>
          <span>Members: ${org.members.length}</span>
        </div>
      `;
      container.appendChild(card);
    });

    const newCard = document.createElement('div');
    newCard.className = 'card new-card';
    newCard.onclick = () => showCreateModal();
    newCard.textContent = '+ New Organization';
    container.appendChild(newCard);

  } catch (err) {
    container.innerHTML = '<div class="empty-state">Failed to load organizations</div>';
  }
};

const showCreateModal = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>Create Organization</h2>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="input" id="org-title" placeholder="Organization name">
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" class="input" id="org-desc" placeholder="Short description">
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="createOrg()">Create</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('org-title').focus();

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
};

const createOrg = async () => {
  const title = document.getElementById('org-title').value.trim();
  const description = document.getElementById('org-desc').value.trim();

  if (!title) {
    showToast('Title is required');
    return;
  }

  try {
    await api.createOrganization(title, description);
    document.querySelector('.modal-overlay').remove();
    showToast('Organization created');
    loadOrganizations();
  } catch (err) {
    showToast(err.message);
  }
};

document.addEventListener('DOMContentLoaded', loadOrganizations);
