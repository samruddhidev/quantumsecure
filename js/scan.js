/**
 * Mobile Scan & Pay Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  const dropzone = document.getElementById('scan-dropzone');
  const uploadGalleryBtn = document.getElementById('upload-gallery-btn');
  const fileInput = document.getElementById('qr-file-input');
  const presetsContainer = document.getElementById('merchant-presets-container');
  const torchBtn = document.getElementById('torch-toggle-btn');

  // Confirmation Modal Elements
  const modal = document.getElementById('scan-confirm-modal');
  const modalMerchantName = document.getElementById('modal-merchant-name');
  const modalMerchantId = document.getElementById('modal-merchant-id');
  const modalAmountInput = document.getElementById('modal-amount-input');
  const modalNoteInput = document.getElementById('modal-note-input');
  const modalPayBtn = document.getElementById('modal-pay-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  let selectedMerchant = null;
  let currentBalance = 0;
  let isTorchOn = false;

  // Flashlight simulation
  if (torchBtn) {
    torchBtn.addEventListener('click', () => {
      isTorchOn = !isTorchOn;
      showToast(isTorchOn ? 'Flashlight turned ON' : 'Flashlight turned OFF', 'info');
      torchBtn.style.color = isTorchOn ? '#facc15' : '#fff';
    });
  }

  // Fetch Balance
  try {
    const balRes = await API.getBalance();
    if (balRes.success) currentBalance = balRes.balance;
  } catch (e) {}

  // Presets
  const PRESET_MERCHANTS = [
    { id: 'starbucks@paytm', name: 'Starbucks Coffee', avatar: '☕', defaultAmount: 320.00, category: 'Café & Dining' },
    { id: 'chaipoint@icici', name: 'Chai Point', avatar: '🍵', defaultAmount: 80.00, category: 'Snacks & Beverages' },
    { id: 'freshmart@okhdfcbank', name: 'Fresh Mart Supermarket', avatar: '🛒', defaultAmount: 1450.00, category: 'Groceries' },
    { id: 'metro@sbi', name: 'Metro Rail Transit', avatar: '🚇', defaultAmount: 60.00, category: 'Transportation' }
  ];

  if (presetsContainer) {
    presetsContainer.innerHTML = '';
    PRESET_MERCHANTS.forEach(merchant => {
      const card = document.createElement('div');
      card.className = 'mobile-card';
      card.style.cssText = 'padding: 12px 14px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;';
      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 22px;">${merchant.avatar}</div>
          <div>
            <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">${merchant.name}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${merchant.category}</div>
          </div>
        </div>
        <div style="font-size: 13px; font-weight: 700; color: var(--primary);">${formatINR(merchant.defaultAmount)}</div>
      `;
      card.addEventListener('click', () => {
        openConfirmModal(merchant);
      });
      presetsContainer.appendChild(card);
    });
  }

  // Gallery Upload
  if (uploadGalleryBtn && fileInput) {
    uploadGalleryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        showToast('QR Code Decoded Successfully!', 'success');
        const randomMerchant = PRESET_MERCHANTS[Math.floor(Math.random() * PRESET_MERCHANTS.length)];
        openConfirmModal(randomMerchant);
      }
    });
  }

  function openConfirmModal(merchant) {
    selectedMerchant = merchant;
    if (modalMerchantName) modalMerchantName.textContent = merchant.name;
    if (modalMerchantId) modalMerchantId.textContent = `UPI ID: ${merchant.id}`;
    if (modalAmountInput) modalAmountInput.value = merchant.defaultAmount;
    if (modalNoteInput) modalNoteInput.value = `Payment to ${merchant.name}`;

    if (modal) modal.classList.add('active');
  }

  if (modalCancelBtn && modal) {
    modalCancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modalPayBtn) {
    modalPayBtn.addEventListener('click', () => {
      const amount = parseFloat(modalAmountInput.value);
      if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
      }
      if (amount > currentBalance) {
        showToast('Amount exceeds available balance', 'error');
        return;
      }

      const pendingTx = {
        type: 'scan',
        merchantId: selectedMerchant.id,
        merchantName: selectedMerchant.name,
        amount: amount,
        note: modalNoteInput ? modalNoteInput.value.trim() : 'Merchant payment',
        timestamp: new Date().toISOString()
      };

      SessionStore.setPendingTx(pendingTx);
      window.location.href = 'pin.html';
    });
  }
});
