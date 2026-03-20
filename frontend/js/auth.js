const showToast = (message) => {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
};

const handleAuthError = () => {
  localStorage.clear();
  window.location.href = 'auth.html';
};

const requireAuth = () => {
  if (!isLoggedIn()) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
};

const logout = () => {
  clearToken();
  window.location.href = 'auth.html';
};
