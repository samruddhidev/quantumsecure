/**
 * Mobile Phone Home Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const balanceEl = document.getElementById('user-balance');
  const balanceToggleBtn = document.getElementById('balance-toggle-btn');
  const eyeBtnText = document.getElementById('eye-btn-text');
  const recentListEl = document.getElementById('recent-transactions-list');
  const contactsListEl = document.getElementById('quick-contacts-list');
  const primaryBankLabel = document.getElementById('primary-bank-label');

  let currentBal = 24850.00;
  let isHidden = false;

  function renderBalance() {
    if (!balanceEl) return;
    if (isHidden) {
      balanceEl.textContent = '₹ ••••••';
      if (eyeBtnText) eyeBtnText.textContent = 'Show';
    } else {
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(currentBal);
      balanceEl.textContent = formatted;
      if (eyeBtnText) eyeBtnText.textContent = 'Hide';
    }
  }

  // Render initial balance immediately
  renderBalance();

  if (balanceToggleBtn) {
    balanceToggleBtn.addEventListener('click', () => {
      isHidden = !isHidden;
      renderBalance();
    });
  }

  // Load User & Bank
  try {
    const userRes = await API.getUser();
    if (userRes && userRes.success && userRes.user && primaryBankLabel && userRes.user.primaryBank) {
      primaryBankLabel.textContent = `${userRes.user.primaryBank.bankName} ${userRes.user.primaryBank.accountNo}`;
    }
  } catch (err) {}

  // Load Balance from API
  try {
    const balRes = await API.getBalance();
    if (balRes && balRes.success && typeof balRes.balance === 'number') {
      currentBal = balRes.balance;
      renderBalance();
    }
  } catch (err) {
    renderBalance();
  }

  // Load Frequent Contacts
  try {
    const contactsRes = await API.getFrequentContacts();
    if (contactsRes && contactsRes.success && contactsListEl && contactsRes.contacts && contactsRes.contacts.length > 0) {
      contactsListEl.innerHTML = '';
      contactsRes.contacts.forEach(contact => {
        const btn = document.createElement('a');
        btn.href = `send.html?recipient=${encodeURIComponent(contact.upiId)}&name=${encodeURIComponent(contact.name)}`;
        btn.className = 'avatar-contact-btn';
        btn.innerHTML = `
          <div class="avatar-circle">${contact.avatar || contact.name.substring(0, 2).toUpperCase()}</div>
          <span class="avatar-name">${contact.name}</span>
        `;
        contactsListEl.appendChild(btn);
      });
    }
  } catch (err) {}

  // Load Recent Transactions
  try {
    const txRes = await API.getRecentTransactions(5);
    if (txRes && txRes.success && recentListEl) {
      recentListEl.innerHTML = '';
      if (txRes.transactions.length === 0) {
        recentListEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 18px 0; font-size: 13px;">No transactions yet.</div>';
      } else {
        txRes.transactions.forEach(tx => {
          const item = document.createElement('div');
          item.className = 'mobile-tx-item';
          const isDebit = tx.type === 'debit';
          const isCredit = tx.type === 'credit';
          const isFailed = tx.status === 'failed';

          const avatarClass = isFailed ? 'failed' : isCredit ? 'credited' : 'debited';
          const amountClass = isFailed ? 'failed' : isCredit ? 'credited' : 'debited';
          const prefix = isFailed ? '' : isCredit ? '+' : '-';
          const initials = (tx.title || 'TX').substring(0, 2).toUpperCase();

          item.innerHTML = `
            <div class="mobile-tx-left">
              <div class="mobile-tx-avatar ${avatarClass}">${initials}</div>
              <div class="mobile-tx-details">
                <div class="mobile-tx-title">${tx.title || (isDebit ? tx.recipientName : tx.senderName)}</div>
                <div class="mobile-tx-subtitle">${formatDateOnly(tx.timestamp)} • ${tx.note || 'UPI'}</div>
              </div>
            </div>
            <div class="mobile-tx-right">
              <div class="mobile-tx-amount ${amountClass}">${prefix}${formatINR(tx.amount)}</div>
              <span class="tx-status-badge ${tx.status}" style="font-size: 10px; text-transform: capitalize; color: var(--text-muted);">${tx.status}</span>
            </div>
          `;

          item.addEventListener('click', () => {
            window.location.href = 'history.html';
          });

          recentListEl.appendChild(item);
        });
      }
    }
  } catch (err) {}
});
