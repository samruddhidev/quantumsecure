/**
 * ============================================================================
 * UPI MOBILE PHONE APP - SHARED STATE & UI HELPERS
 * ============================================================================
 */

// Simple client-side Session Store helpers
const SessionStore = {
  getPendingTx() {
    try {
      const data = sessionStorage.getItem("upi_pending_transaction");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setPendingTx(tx) {
    try {
      sessionStorage.setItem("upi_pending_transaction", JSON.stringify(tx));
    } catch (e) {
      console.warn("Failed to set pending tx in sessionStorage", e);
    }
  },
  clearPendingTx() {
    sessionStorage.removeItem("upi_pending_transaction");
  },
  getLastResult() {
    try {
      const data = sessionStorage.getItem("upi_last_transaction_result");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setLastResult(res) {
    try {
      sessionStorage.setItem("upi_last_transaction_result", JSON.stringify(res));
    } catch (e) {
      console.warn("Failed to set last result in sessionStorage", e);
    }
  },
  clearLastResult() {
    sessionStorage.removeItem("upi_last_transaction_result");
  }
};

// Currency Formatter
function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// Date Formatter
function formatDateTime(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function formatDateOnly(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Toast notification inside phone container
function showToast(message, type = 'info') {
  let container = document.getElementById('phone-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'phone-toast-container';
    container.className = 'phone-toast-container';
    const phoneViewport = document.querySelector('.phone-viewport-container') || document.body;
    phoneViewport.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `phone-toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Setup Shared Mobile UI States
document.addEventListener('DOMContentLoaded', async () => {
  // Update live clock in phone status bar
  const clockEl = document.getElementById('phone-status-time');
  if (clockEl) {
    const updateClock = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    updateClock();
    setInterval(updateClock, 30000);
  }

  // Highlight active bottom nav item
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.bottom-nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Populate avatar initials
  const headerAvatar = document.getElementById('header-avatar');
  if (headerAvatar && window.API) {
    try {
      const res = await API.getUser();
      if (res.success && res.user) {
        headerAvatar.textContent = res.user.avatar || res.user.name.substring(0, 2).toUpperCase();
      }
    } catch (e) {}
  }
});

// Export globals
window.SessionStore = SessionStore;
window.formatINR = formatINR;
window.formatDateTime = formatDateTime;
window.formatDateOnly = formatDateOnly;
window.showToast = showToast;
