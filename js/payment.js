/* ==========================================
   WORKHUB - PAYMENT CHECKOUT JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadCheckoutSummary();
  initPaymentTabSwitching();
  initPaymentConfirmation();
  initBackButton();
});

// Load summary details dynamically from pendingCheckout in sessionStorage
function loadCheckoutSummary() {
  const pendingData = sessionStorage.getItem('pendingCheckout');
  let data = null;
  if (pendingData) {
    try { data = JSON.parse(pendingData); } catch(e){}
  }

  if (!data) {
    const sessUser = JSON.parse(localStorage.getItem('workhub_user_session') || '{}');
    data = {
      workspaceName: "Executive Private Cabin P-12",
      workspaceType: "Private Cabin",
      date: new Date().toISOString().split('T')[0],
      timeRange: "10:00 AM – 11:00 AM",
      duration: "1 Hour",
      hourlyRate: "$45.00",
      subtotal: "$45.00",
      taxes: "$4.50",
      totalAmount: "$49.50",
      userName: sessUser.name || "Member",
      userEmail: sessUser.email || ""
    };
  }

  // Update Payment Order Summary UI Elements
  const wsNameElem = document.getElementById('summary-plan-name') || document.getElementById('summary-ws-name');
  const durationElem = document.getElementById('summary-duration');
  const userElem = document.getElementById('summary-user-details');
  const basePriceElem = document.getElementById('summary-base-price');
  const taxesElem = document.getElementById('summary-taxes');
  const totalPriceElem = document.getElementById('summary-total-price');

  const summaryDetails = document.getElementById('payment-summary-details');

  if (wsNameElem) wsNameElem.textContent = data.workspaceName || data.title || "Executive Private Cabin P-12";
  
  if (summaryDetails) {
    const sessUser = JSON.parse(localStorage.getItem('workhub_user_session') || '{}');
    const displayUserName = data.userName || sessUser.name || 'Member';
    const displayUserEmail = data.userEmail || sessUser.email || '';
    
    summaryDetails.innerHTML = `
      <div style="margin-bottom: 0.85rem; font-size: 0.9rem;">
        <span style="color: var(--text-muted); display: block;">Workspace</span>
        <strong style="color: var(--text-main); font-size: 1rem;">${data.workspaceName || data.title || 'Executive Private Cabin P-12'}</strong>
      </div>
      <div style="margin-bottom: 0.85rem; font-size: 0.9rem;">
        <span style="color: var(--text-muted); display: block;">Date & Time</span>
        <strong>${data.date || data.bookingDate || new Date().toISOString().split('T')[0]}</strong><br>
        <span style="color: var(--primary); font-weight: 600;">${data.timeRange || '10:00 AM – 11:00 AM'} (${data.duration || '1 Hour'})</span>
      </div>
      <div style="margin-bottom: 0.85rem; font-size: 0.9rem;">
        <span style="color: var(--text-muted); display: block;">Booked By</span>
        <strong>${displayUserName}</strong> (${displayUserEmail})
      </div>
    `;
  }

  if (basePriceElem) basePriceElem.textContent = data.subtotal || data.basePrice || "$45.00";
  if (taxesElem) taxesElem.textContent = data.taxes || data.tax || "$4.50";
  if (totalPriceElem) totalPriceElem.textContent = data.totalAmount || "$49.50";
}

// Switch between Credit Card, Debit Card, UPI, and Net Banking tabs
function initPaymentTabSwitching() {
  const methodTabs = document.querySelectorAll('.payment-tab-btn, .payment-method-tab');
  const formPanels = document.querySelectorAll('.payment-panel, .payment-form-panel');

  methodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      methodTabs.forEach(t => t.classList.remove('active'));
      formPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const method = tab.getAttribute('data-method') || tab.getAttribute('data-target')?.replace('panel-', '');
      const targetPanel = document.getElementById(`panel-${method}`) || document.getElementById(tab.getAttribute('data-target'));
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Net banking bank option buttons
  const bankBtns = document.querySelectorAll('.bank-option-btn');
  bankBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bankBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
}

// Back Button Navigation
function initBackButton() {
  const backBtn = document.getElementById('btn-payment-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'booking.html';
    });
  }
}

// Payment Form Submission & Backend Sync
function initPaymentConfirmation() {
  const payBtn = document.getElementById('btn-confirm-payment') || document.getElementById('btn-pay-now');
  if (!payBtn) return;

  payBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const pendingStr = sessionStorage.getItem('pendingCheckout');
    let pendingData = {};
    if (pendingStr) {
      try { pendingData = JSON.parse(pendingStr); } catch(e){}
    }

    // Determine active payment method
    const activeTab = document.querySelector('.payment-tab-btn.active, .payment-method-tab.active');
    const method = activeTab ? (activeTab.getAttribute('data-method') || 'credit') : 'credit';

    let paymentMethodLabel = 'Credit Card';
    if (method === 'credit') paymentMethodLabel = 'Credit Card';
    else if (method === 'debit') paymentMethodLabel = 'Debit Card';
    else if (method === 'upi') paymentMethodLabel = 'UPI Payment';
    else if (method === 'netbank') paymentMethodLabel = 'Net Banking';

    const bookingId = pendingData.bookingId || `BK-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const sessUser = JSON.parse(localStorage.getItem('workhub_user_session') || '{}');

    const confirmedBooking = {
      bookingId,
      deskId: pendingData.deskId || pendingData.workspaceId || 'D-101',
      workspaceId: pendingData.workspaceId || 'WS001',
      workspaceName: pendingData.workspaceName || 'Executive Private Cabin P-12',
      workspaceType: pendingData.workspaceType || 'Private Cabin',
      location: pendingData.location || 'Downtown Executive Hub',
      date: pendingData.date || pendingData.bookingDate || new Date().toISOString().split('T')[0],
      bookingDate: pendingData.date || pendingData.bookingDate || new Date().toISOString().split('T')[0],
      startTime: pendingData.startTime || '10:00 AM',
      endTime: pendingData.endTime || '11:00 AM',
      timeSlot: pendingData.timeRange || '10:00 AM – 11:00 AM',
      duration: pendingData.duration || '1 Hour',
      durationHours: pendingData.durationHours || 1,
      userName: pendingData.userName || sessUser.name || 'Member',
      userEmail: pendingData.userEmail || sessUser.email || '',
      totalPrice: pendingData.totalAmount || '$49.50',
      totalAmount: pendingData.totalAmount || '$49.50',
      bookingStatus: 'Active',
      paymentStatus: 'Paid',
      paymentMethod: paymentMethodLabel,
      transactionId
    };

    payBtn.disabled = true;
    payBtn.textContent = 'Processing Payment...';
    if (window.showLoading) showLoading();

    try {
      // 1. Create & Confirm Booking in Backend
      const bookingRes = await API.createBooking(confirmedBooking);

      if (bookingRes && bookingRes.success) {
        // 2. Create Payment Record in Backend
        const paymentPayload = {
          bookingId: bookingRes.bookingId || bookingId,
          amount: parseFloat(String(confirmedBooking.totalAmount).replace(/[^0-9.-]+/g, "")) || 49.50,
          paymentMethod: paymentMethodLabel,
          transactionId
        };

        if (API.createPayment) {
          try { await API.createPayment(paymentPayload); } catch(pErr){}
        }

        sessionStorage.setItem('confirmedBooking', JSON.stringify({
          ...confirmedBooking,
          bookingId: bookingRes.bookingId || bookingId
        }));

        if (window.showToast) showToast('Payment processed successfully! Booking confirmed.', 'success');
        
        setTimeout(() => {
          window.location.href = 'booking-success.html';
        }, 800);
      } else {
        const errorMsg = (bookingRes && bookingRes.message) ? bookingRes.message : 'Payment confirmation failed.';
        if (window.showToast) showToast(`❌ ${errorMsg}`, 'error');
        payBtn.disabled = false;
        payBtn.textContent = 'Confirm Payment';
      }
    } catch (err) {
      console.error('Payment Error:', err);
      if (window.showToast) showToast(err.message || 'Payment confirmation failed. Please try again.', 'error');
      payBtn.disabled = false;
      payBtn.textContent = 'Confirm Payment';
    } finally {
      if (window.hideLoading) hideLoading();
    }
  });
}
