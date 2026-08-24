/**
 * Page-specific logic for profile.html (Profile & Settings)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const userNameEl = document.getElementById('profile-name');
  const userPhoneEl = document.getElementById('profile-phone');
  const userEmailEl = document.getElementById('profile-email');
  const userUpiEl = document.getElementById('profile-upi');
  const userAvatarEl = document.getElementById('profile-avatar');
  const copyUpiBtn = document.getElementById('copy-upi-btn');
  const resetDataBtn = document.getElementById('reset-demo-data-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const primaryBankEl = document.getElementById('profile-primary-bank');
  const primaryAccountEl = document.getElementById('profile-primary-account');
  const secondaryBankEl = document.getElementById('profile-secondary-bank');
  const secondaryAccountEl = document.getElementById('profile-secondary-account');

  try {
    const res = await API.getUser();
    if (res.success && res.user) {
      const u = res.user;
      if (userNameEl) userNameEl.textContent = u.name;
      if (userPhoneEl) userPhoneEl.textContent = u.phone;
      if (userEmailEl) userEmailEl.textContent = u.email;
      if (userUpiEl) userUpiEl.textContent = u.upiId;
      if (userAvatarEl) userAvatarEl.textContent = u.avatar || u.name.substring(0, 2).toUpperCase();

      if (u.primaryBank) {
        if (primaryBankEl) primaryBankEl.textContent = u.primaryBank.bankName;
        if (primaryAccountEl) primaryAccountEl.textContent = `${u.primaryBank.accountType} (${u.primaryBank.accountNo}) • IFSC: ${u.primaryBank.ifsc}`;
      }

      if (u.secondaryBank) {
        if (secondaryBankEl) secondaryBankEl.textContent = u.secondaryBank.bankName;
        if (secondaryAccountEl) secondaryAccountEl.textContent = `${u.secondaryBank.accountType} (${u.secondaryBank.accountNo}) • IFSC: ${u.secondaryBank.ifsc}`;
      }
    }
  } catch (err) {
    console.error("Failed to load profile", err);
  }

  if (copyUpiBtn && userUpiEl) {
    copyUpiBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(userUpiEl.textContent.trim());
      showToast('UPI ID copied to clipboard!', 'success');
    });
  }

  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset all mock balances and transaction history to defaults?')) {
        await API.resetData();
        SessionStore.clearPendingTx();
        SessionStore.clearLastResult();
        showToast('Demo data reset successfully!', 'success');
        setTimeout(() => window.location.reload(), 800);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      SessionStore.clearPendingTx();
      SessionStore.clearLastResult();
      showToast('Logged out successfully', 'info');
      setTimeout(() => window.location.href = 'index.html', 600);
    });
  }
});
