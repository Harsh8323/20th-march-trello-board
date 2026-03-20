const API_BASE = 'http://localhost:3000/api/v1';

const getToken = () => localStorage.getItem('token');

const setToken = (token) => localStorage.setItem('token', token);

const clearToken = () => localStorage.removeItem('token');

const isLoggedIn = () => !!getToken();

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'token': token }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

const api = {
  signup: (username, password) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ username, password }) }),

  signin: (username, password) =>
    request('/auth/signin', { method: 'POST', body: JSON.stringify({ username, password }) }),

  createOrganization: (title, description) =>
    request('/organizations', { method: 'POST', body: JSON.stringify({ title, description }) }),

  getOrganization: (organizationId) =>
    request(`/organizations?organizationId=${organizationId}`),

  getOrganizations: async () => {
    const orgs = [];
    for (let i = 1; i <= 100; i++) {
      try {
        const data = await request(`/organizations?organizationId=${i}`);
        if (data.success && data.organization) {
          orgs.push(data.organization);
        }
      } catch {
        break;
      }
    }
    return orgs;
  },

  createBoard: (organizationId, title, description) =>
    request('/boards', { method: 'POST', body: JSON.stringify({ organizationId, title, description }) }),

  getBoards: (organizationId) =>
    request(`/boards/all?organizationId=${organizationId}`),

  getBoard: (boardId) =>
    request(`/boards/${boardId}`),

  createIssue: (boardId, title, description, assigneeUsername) =>
    request('/issues', { method: 'POST', body: JSON.stringify({ boardId, title, description, assigneeUsername }) }),

  getIssues: (boardId) =>
    request(`/issues/all?boardId=${boardId}`),

  updateIssue: (issueId, title, description, status, assigneeUsername) =>
    request(`/issues/${issueId}`, { method: 'PUT', body: JSON.stringify({ title, description, status, assigneeUsername }) }),

  deleteIssue: (issueId) =>
    request(`/issues/${issueId}`, { method: 'DELETE' }),

  addMember: (organizationId, memberUsername) =>
    request('/members/add', { method: 'POST', body: JSON.stringify({ organizationId, memberUsername }) }),

  getMembers: (organizationId) =>
    request(`/members/list?organizationId=${organizationId}`),

  removeMember: (organizationId, memberUsername) =>
    request(`/members/remove?organizationId=${organizationId}&memberUsername=${memberUsername}`, { method: 'DELETE' })
};

window.api = api;
