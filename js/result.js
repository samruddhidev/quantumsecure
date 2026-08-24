/**
 * Page-specific logic for result.html (Transaction Result)
 */
document.addEventListener('DOMContentLoaded', async () => {
  let resultData = SessionStore.getLastResult();

  // If no result in session, fetch the latest transaction as fallback
  if (!resultData) {
    try {
      const txRes = await API.getRecentTransactions(1);
      if (txRes.success && txRes.transactions.length > 0) {
        const tx = txRes.transactions[0];
        resultData = {
          success: tx.status === 'success',
          transactionId: tx.id,
          utr: tx.utr,
          amount: tx.amount,
          recipient: tx.recipientUpi || tx.senderUpi,
          recipientName: tx.title || tx.recipientName || tx.senderName,
          note: tx.note,
          timestamp: tx.timestamp,
          status: tx.status,
          debitedFrom: tx.debitedFrom
        };
      }
    } catch (e) {}
  }

  // Graceful fallback demo
  if (!resultData) {
    resultData = {
      success: true,
      transactionId: "TXN" + Math.floor(1000000 + Math.random() * 9000000),
      utr: "324567891024",
      amount: 500.00,
      recipient: "rahul@okhdfcbank",
      recipientName: "Rahul Sharma",
      note: "UPI Payment",
      timestamp: new Date().toISOString(),
      status: "success",
      debitedFrom: "HDFC Bank •••• 4821"
    };
  }

  const iconWrapper = document.getElementById('result-icon-wrapper');
  const titleEl = document.getElementById('result-title');
  const subtitleEl = document.getElementById('result-subtitle');
  const amountEl = document.getElementById('result-amount');
  const payeeNameEl = document.getElementById('res-payee-name');
  const payeeUpiEl = document.getElementById('res-payee-upi');
  const utrEl = document.getElementById('res-utr');
  const txIdEl = document.getElementById('res-txid');
  const timeEl = document.getElementById('res-time');
  const bankEl = document.getElementById('res-bank');
  const balanceRow = document.getElementById('res-balance-row');
  const balanceEl = document.getElementById('res-balance');
  const noteEl = document.getElementById('res-note');
  const copyUtrBtn = document.getElementById('copy-utr-btn');
  const printBtn = document.getElementById('print-receipt-btn');

  const isSuccess = resultData.success && resultData.status !== 'failed';

  if (iconWrapper) {
    if (isSuccess) {
      iconWrapper.className = 'result-icon-wrapper success';
      iconWrapper.innerHTML = `
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      iconWrapper.className = 'result-icon-wrapper failure';
      iconWrapper.innerHTML = `
        <svg viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    }
  }

  if (titleEl) {
    titleEl.textContent = isSuccess ? 'Payment Successful' : 'Payment Failed';
  }

  if (subtitleEl) {
    subtitleEl.textContent = isSuccess
      ? 'Transaction completed and confirmed by bank'
      : (resultData.error || 'The bank declined this transaction. Please try again.');
  }

  if (amountEl) {
    amountEl.textContent = formatINR(resultData.amount);
  }

  if (payeeNameEl) payeeNameEl.textContent = resultData.recipientName || 'Payee';
  if (payeeUpiEl) payeeUpiEl.textContent = resultData.recipient || resultData.merchantId || '-';
  if (utrEl) utrEl.textContent = resultData.utr || '-';
  if (txIdEl) txIdEl.textContent = resultData.transactionId || '-';
  if (timeEl) timeEl.textContent = formatDateTime(resultData.timestamp);
  if (bankEl) bankEl.textContent = resultData.debitedFrom || 'HDFC Bank •••• 4821';
  if (noteEl) noteEl.textContent = resultData.note || 'Payment via UPI';

  if (resultData.newBalance !== undefined && balanceEl && balanceRow) {
    balanceRow.style.display = 'flex';
    balanceEl.textContent = formatINR(resultData.newBalance);
  }

  if (copyUtrBtn && resultData.utr) {
    copyUtrBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(resultData.utr);
      showToast('UTR Number copied to clipboard!', 'success');
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
