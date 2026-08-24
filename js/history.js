/**
 * Page-specific logic for history.html (Transaction History)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('history-search-input');
  const filterChips = document.querySelectorAll('[data-filter]');
  const txListContainer = document.getElementById('history-tx-list');
  const totalDebitedEl = document.getElementById('total-debited-stat');
  const totalCreditedEl = document.getElementById('total-credited-stat');

  let currentFilter = 'all';
  let searchQuery = '';

  async function loadTransactions() {
    if (!txListContainer) return;
    txListContainer.innerHTML = '<div style="text-align: center; padding: 30px;"><div class="spinner"></div></div>';

    try {
      const res = await API.getAllTransactions({
        type: currentFilter,
        query: searchQuery
      });

      if (res.success) {
        renderList(res.transactions);
      }
    } catch (err) {
      console.error("Failed to load transaction history", err);
      txListContainer.innerHTML = '<div style="text-align:center; padding:24px; color:var(--danger);">Error loading transactions</div>';
    }
  }

  function renderList(transactions) {
    if (!txListContainer) return;
    txListContainer.innerHTML = '';

    if (transactions.length === 0) {
      txListContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
          <svg style="width: 48px; height: 48px; stroke: currentColor; fill: none; margin-bottom: 12px;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <div style="font-size: 16px; font-weight: 600; color: var(--text-main);">No transactions found</div>
          <div style="font-size: 13px; margin-top: 4px;">Try modifying your search or filter</div>
        </div>
      `;
      return;
    }

    let totalDebited = 0;
    let totalCredited = 0;

    transactions.forEach(tx => {
      if (tx.status === 'success') {
        if (tx.type === 'debit') totalDebited += tx.amount;
        if (tx.type === 'credit') totalCredited += tx.amount;
      }

      const item = document.createElement('div');
      item.className = 'transaction-item';

      const isDebit = tx.type === 'debit';
      const isCredit = tx.type === 'credit';
      const isFailed = tx.status === 'failed';

      const avatarClass = isFailed ? 'failed' : isCredit ? 'credited' : 'debited';
      const amountClass = isFailed ? 'failed' : isCredit ? 'credited' : 'debited';
      const prefix = isFailed ? '' : isCredit ? '+' : '-';
      const initials = (tx.title || 'TX').substring(0, 2).toUpperCase();

      item.innerHTML = `
        <div class="tx-left">
          <div class="tx-icon-avatar ${avatarClass}">${initials}</div>
          <div class="tx-details">
            <div class="tx-title">${tx.title || (isDebit ? tx.recipientName : tx.senderName)}</div>
            <div class="tx-subtitle">${formatDateTime(tx.timestamp)} • ${tx.note || tx.category || 'UPI Transfer'}</div>
          </div>
        </div>
        <div class="tx-right">
          <div class="tx-amount ${amountClass}">${prefix}${formatINR(tx.amount)}</div>
          <span class="tx-status-badge ${tx.status}">${tx.status}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        showTransactionModal(tx);
      });

      txListContainer.appendChild(item);
    });

    if (totalDebitedEl) totalDebitedEl.textContent = formatINR(totalDebited);
    if (totalCreditedEl) totalCreditedEl.textContent = formatINR(totalCredited);
  }

  // Search input debounce
  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchQuery = e.target.value;
      searchTimer = setTimeout(() => {
        loadTransactions();
      }, 250);
    });
  }

  // Filter chips click
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter');
      loadTransactions();
    });
  });

  loadTransactions();
});

// Modal helper
function showTransactionModal(tx) {
  let modal = document.getElementById('history-detail-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'history-detail-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const isCredit = tx.type === 'credit';
  const prefix = tx.status === 'failed' ? '' : isCredit ? '+' : '-';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="card-header" style="margin-bottom: 16px;">
        <h3 class="card-title">Transaction Details</h3>
        <button id="close-hist-modal" style="font-size: 20px; color: var(--text-muted);">&times;</button>
      </div>
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 28px; font-weight: 700; color: ${isCredit ? 'var(--accent-green)' : 'var(--text-main)'};">
          ${prefix}${formatINR(tx.amount)}
        </div>
        <div style="margin-top: 6px;">
          <span class="tx-status-badge ${tx.status}">${tx.status.toUpperCase()}</span>
        </div>
      </div>
      <div class="receipt-breakdown" style="margin-bottom: 20px;">
        <div class="receipt-row">
          <span class="label">${isCredit ? 'Received From' : 'Paid To'}</span>
          <span class="value">${tx.title || (isCredit ? tx.senderName : tx.recipientName)}</span>
        </div>
        <div class="receipt-row">
          <span class="label">UPI ID</span>
          <span class="value">${tx.recipientUpi || tx.senderUpi || '-'}</span>
        </div>
        <div class="receipt-row">
          <span class="label">UTR Number</span>
          <span class="value" style="display: flex; align-items: center; gap: 6px;">
            ${tx.utr || '-'}
            <button id="modal-copy-utr" style="color: var(--primary); font-size: 11px; font-weight: 600;">COPY</button>
          </span>
        </div>
        <div class="receipt-row">
          <span class="label">Transaction ID</span>
          <span class="value">${tx.id || '-'}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Date & Time</span>
          <span class="value">${formatDateTime(tx.timestamp)}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Debited / Credited Account</span>
          <span class="value">${tx.debitedFrom || 'HDFC Bank •••• 4821'}</span>
        </div>
        ${tx.note ? `
        <div class="receipt-row">
          <span class="label">Note</span>
          <span class="value">${tx.note}</span>
        </div>` : ''}
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary btn-block" id="modal-hist-close-btn">Close</button>
      </div>
    </div>
  `;

  requestAnimationFrame(() => modal.classList.add('active'));

  const closeBtn = modal.querySelector('#close-hist-modal');
  const closeBtn2 = modal.querySelector('#modal-hist-close-btn');
  const copyBtn = modal.querySelector('#modal-copy-utr');

  const closeModal = () => modal.classList.remove('active');

  closeBtn.addEventListener('click', closeModal);
  closeBtn2.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (copyBtn && tx.utr) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(tx.utr);
      showToast('UTR Number copied!', 'success');
    });
  }
}
