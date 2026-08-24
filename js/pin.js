/**
 * Page-specific logic for pin.html (PIN Verification)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const pendingTx = SessionStore.getPendingTx();

  // Redirect to home if no pending transaction is present
  if (!pendingTx || !pendingTx.amount) {
    showToast('No pending transaction found', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
    return;
  }

  // Populate UI
  const payeeNameEl = document.getElementById('pin-payee-name');
  const payeeUpiEl = document.getElementById('pin-payee-upi');
  const amountEl = document.getElementById('pin-amount');
  const bankInfoEl = document.getElementById('pin-bank-info');
  const pinDotsContainer = document.getElementById('pin-dots');
  const pinErrorEl = document.getElementById('pin-error-msg');
  const submitBtn = document.getElementById('pin-submit-btn');

  const displayName = pendingTx.recipientName || pendingTx.merchantName || 'Payee';
  const displayUpi = pendingTx.recipient || pendingTx.merchantId || '-';

  if (payeeNameEl) payeeNameEl.textContent = displayName;
  if (payeeUpiEl) payeeUpiEl.textContent = displayUpi;
  if (amountEl) amountEl.textContent = formatINR(pendingTx.amount);

  // Fetch Bank info
  try {
    const userRes = await API.getUser();
    if (userRes.success && userRes.user && userRes.user.primaryBank) {
      if (bankInfoEl) {
        bankInfoEl.textContent = `${userRes.user.primaryBank.bankName} ${userRes.user.primaryBank.accountNo}`;
      }
    }
  } catch (e) {}

  let enteredPin = '';
  const PIN_LENGTH = 4;
  let isSubmitting = false;

  function updateDots() {
    if (!pinDotsContainer) return;
    const dots = pinDotsContainer.querySelectorAll('.npci-dot');
    dots.forEach((dot, idx) => {
      if (idx < enteredPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });

    if (pinErrorEl) {
      pinErrorEl.style.display = 'none';
      pinDotsContainer.classList.remove('error');
    }
  }

  function handleDigit(digit) {
    if (isSubmitting || enteredPin.length >= PIN_LENGTH) return;
    enteredPin += digit;
    updateDots();

    if (enteredPin.length === PIN_LENGTH) {
      setTimeout(() => verifyAndExecute(), 200);
    }
  }

  function handleBackspace() {
    if (isSubmitting || enteredPin.length === 0) return;
    enteredPin = enteredPin.slice(0, -1);
    updateDots();
  }

  function handleClear() {
    if (isSubmitting) return;
    enteredPin = '';
    updateDots();
  }

  // Keypad click handlers
  const keypadButtons = document.querySelectorAll('[data-key]');
  keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      if (key === 'backspace') {
        handleBackspace();
      } else if (key === 'submit') {
        if (enteredPin.length === PIN_LENGTH) {
          verifyAndExecute();
        } else {
          showPinError('Please enter 4-digit UPI PIN');
        }
      } else {
        handleDigit(key);
      }
    });
  });

  // Physical Keyboard Listener
  document.addEventListener('keydown', (e) => {
    if (isSubmitting) return;
    if (/^[0-9]$/.test(e.key)) {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter') {
      if (enteredPin.length === PIN_LENGTH) {
        verifyAndExecute();
      }
    }
  });

  function showPinError(msg) {
    if (pinErrorEl) {
      pinErrorEl.textContent = msg;
      pinErrorEl.style.display = 'block';
    }
    if (pinDotsContainer) {
      pinDotsContainer.classList.add('error');
    }
    setTimeout(() => {
      enteredPin = '';
      updateDots();
    }, 600);
  }

  async function verifyAndExecute() {
    if (isSubmitting) return;
    isSubmitting = true;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span>';
    }

    try {
      const verifyRes = await API.verifyPin(enteredPin);
      if (!verifyRes.success) {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '✓';
        }
        showPinError(verifyRes.message || 'Incorrect UPI PIN. Please try again.');
        return;
      }

      // PIN is valid, dispatch payment execution
      let txResult;
      if (pendingTx.type === 'scan') {
        txResult = await API.scanAndPay({
          merchantId: pendingTx.merchantId,
          merchantName: pendingTx.merchantName,
          amount: pendingTx.amount,
          note: pendingTx.note
        });
      } else {
        txResult = await API.sendMoney({
          recipient: pendingTx.recipient,
          recipientName: pendingTx.recipientName,
          amount: pendingTx.amount,
          note: pendingTx.note
        });
      }

      SessionStore.setLastResult(txResult);
      SessionStore.clearPendingTx();

      window.location.href = 'result.html';
    } catch (err) {
      console.error("Payment processing failed", err);
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '✓';
      }
      showPinError('Payment failed. Please try again.');
    }
  }
});
