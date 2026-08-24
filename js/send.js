/**
 * Mobile Send Money Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('send-money-form');
  const recipientInput = document.getElementById('recipient-input');
  const amountInput = document.getElementById('amount-input');
  const noteInput = document.getElementById('note-input');
  const balanceHint = document.getElementById('available-balance-hint');
  const recipientError = document.getElementById('recipient-error');
  const amountError = document.getElementById('amount-error');
  const contactsContainer = document.getElementById('quick-contacts-chips');
  const denomChips = document.querySelectorAll('.denom-chip');

  let currentBalance = 0;
  let resolvedRecipientName = '';

  // Prefill from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const paramRecipient = urlParams.get('recipient');
  const paramName = urlParams.get('name');

  if (paramRecipient && recipientInput) {
    recipientInput.value = paramRecipient;
    resolvedRecipientName = paramName || '';
  }

  // Load Balance
  try {
    const balRes = await API.getBalance();
    if (balRes.success) {
      currentBalance = balRes.balance;
      if (balanceHint) {
        balanceHint.textContent = `Available Balance: ${formatINR(currentBalance)}`;
      }
    }
  } catch (err) {}

  // Denomination chip listeners
  denomChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const addVal = parseFloat(chip.getAttribute('data-add')) || 0;
      const currentVal = parseFloat(amountInput.value) || 0;
      amountInput.value = (currentVal + addVal).toString();
      amountInput.classList.remove('is-invalid');
      if (amountError) amountError.classList.remove('visible');
    });
  });

  // Load Quick Contact Chips
  try {
    const contactsRes = await API.getFrequentContacts();
    if (contactsRes.success && contactsContainer && contactsRes.contacts.length > 0) {
      contactsContainer.innerHTML = '';
      contactsRes.contacts.forEach(contact => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'filter-chip';
        chip.innerHTML = `<span>${contact.name}</span>`;
        chip.addEventListener('click', () => {
          recipientInput.value = contact.upiId;
          resolvedRecipientName = contact.name;
          recipientInput.classList.remove('is-invalid');
          if (recipientError) recipientError.classList.remove('visible');
          amountInput.focus();
        });
        contactsContainer.appendChild(chip);
      });
    }
  } catch (err) {}

  // Validation
  function validateRecipient() {
    const val = recipientInput.value.trim();
    if (!val) {
      showError(recipientInput, recipientError, 'Please enter UPI ID or mobile number');
      return false;
    }
    const isUpi = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(val);
    const isPhone = /^[6-9]\d{9}$/.test(val);

    if (!isUpi && !isPhone) {
      showError(recipientInput, recipientError, 'Enter a valid UPI ID (name@bank) or 10-digit phone');
      return false;
    }
    clearError(recipientInput, recipientError);
    return true;
  }

  function validateAmount() {
    const val = parseFloat(amountInput.value);
    if (isNaN(val) || val <= 0) {
      showError(amountInput, amountError, 'Enter a valid payment amount');
      return false;
    }
    if (val > currentBalance) {
      showError(amountInput, amountError, `Amount exceeds available balance (${formatINR(currentBalance)})`);
      return false;
    }
    clearError(amountInput, amountError);
    return true;
  }

  function showError(input, errorEl, message) {
    input.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(input, errorEl) {
    input.classList.remove('is-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  recipientInput.addEventListener('blur', validateRecipient);
  recipientInput.addEventListener('input', () => {
    if (recipientInput.classList.contains('is-invalid')) validateRecipient();
  });

  amountInput.addEventListener('blur', validateAmount);
  amountInput.addEventListener('input', () => {
    if (amountInput.classList.contains('is-invalid')) validateAmount();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateRecipient() || !validateAmount()) return;

    const recipient = recipientInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const note = noteInput ? noteInput.value.trim() : '';

    const pendingTx = {
      type: 'send',
      recipient: recipient,
      recipientName: resolvedRecipientName || (recipient.includes('@') ? recipient.split('@')[0] : recipient),
      amount: amount,
      note: note || 'Payment via UPI',
      timestamp: new Date().toISOString()
    };

    SessionStore.setPendingTx(pendingTx);
    window.location.href = 'pin.html';
  });
});
