/* ==========================================
   WORKHUB - PAYMENT CHECKOUT JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadCheckoutSummary();
  initPaymentTabSwitching();
  initPaymentConfirmation();
});

// Load summary details dynamically from pendingCheckout in sessionStorage
function loadCheckoutSummary() {
  const pendingData = sessionStorage.getItem('pendingCheckout');
  let data = null;
  if (pendingData) {
    try { data = JSON.parse(pendingData); } catch(e){}
  }

  if (!data) {
    data = {
      workspaceName: "Executive Private Cabin P-12",
      workspaceType: "Private Cabin",
      date: "2026-07-31",
      timeRange: "10:00 AM – 01:00 PM",
      duration: "3 Hours",
      hourlyRate: "$45.00",
      subtotal: "$135.00",
      taxes: "$13.50",
      totalAmount: "$148.50",
      userName: "Sarah Jenkins",
      userEmail: "sarah.jenkins@cloudscale.ai"
    };
  }

  // Update Payment Order Summary UI Elements
  const wsNameElem = document.getElementById('summary-plan-name');
  const durationElem = document.getElementById('summary-duration');
  const userElem = document.getElementById('summary-user-details');
  const basePriceElem = document.getElementById('summary-base-price');
  const taxesElem = document.getElementById('summary-taxes');
  const totalPriceElem = document.getElementById('summary-total-price');

  if (wsNameElem) wsNameElem.textContent = data.workspaceName || data.title || "Executive Private Cabin P-12";
  if (durationElem) {
    durationElem.innerHTML = `
      Date: <strong>${data.date || data.bookingDate || '2026-07-31'}</strong><br>
      Time Range: <strong>${data.timeRange || '10:00 AM – 01:00 PM'}</strong> (${data.duration || '3 Hours'})
    `;
  }
  if (userElem) {
    userElem.innerHTML = `
      Booked by: <strong>${data.userName || 'Sarah Jenkins'}</strong> (${data.userEmail || 'sarah.jenkins@cloudscale.ai'})
    `;
  }

  if (basePriceElem) basePriceElem.textContent = data.subtotal || data.basePrice || "$135.00";
  if (taxesElem) taxesElem.textContent = data.taxes || data.tax || "$13.50";
  if (totalPriceElem) totalPriceElem.textContent = data.totalAmount || "$148.50";
}

// Payment Methods Tab Switching (Card, UPI, Netbanking)
function initPaymentTabSwitching() {
  const tabs = document.querySelectorAll('.payment-tab');
  const contents = document.querySelectorAll('.payment-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

// Payment Confirmation Submit
function initPaymentConfirmation() {
  const confirmBtn = document.getElementById('btn-confirm-payment');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      showLoading();
      
      const pendingData = JSON.parse(sessionStorage.getItem('pendingCheckout') || '{}');
      const bookingId = 'BK' + new Date().toISOString().slice(0,10).replace(/-/g,"") + '-' + Math.random().toString(36).substring(2,7).toUpperCase();

      const confirmedBooking = {
        bookingId,
        bookingStatus: 'Active',
        status: 'Active',
        paymentStatus: 'Paid',
        bookingDate: pendingData.date || pendingData.bookingDate || new Date().toISOString().split('T')[0],
        title: pendingData.workspaceName || 'Executive Private Cabin P-12',
        workspaceName: pendingData.workspaceName || 'Executive Private Cabin P-12',
        workspaceType: pendingData.workspaceType || pendingData.deskType || 'Private Cabin',
        deskType: pendingData.workspaceType || 'Private Cabin',
        location: pendingData.location || 'Downtown Executive Hub',
        arrivalTime: pendingData.startTime || (pendingData.timeRange ? pendingData.timeRange.split('–')[0].trim() : '10:00 AM'),
        timeSlot: pendingData.timeRange || '10:00 AM – 01:00 PM',
        duration: pendingData.duration || '3 Hours',
        userName: pendingData.userName || 'Sarah Jenkins',
        userEmail: pendingData.userEmail || 'sarah.jenkins@cloudscale.ai',
        totalPrice: pendingData.totalAmount || '$148.50',
        totalAmount: pendingData.totalAmount || '$148.50',
        paymentMethod: 'Credit Card (VISA **** 9012)'
      };

      // Save to mock database
      await API.createBooking(confirmedBooking);
      sessionStorage.setItem('confirmedBooking', JSON.stringify(confirmedBooking));

      hideLoading();
      showToast('Payment successful! Generating receipt...', 'success');
      setTimeout(() => {
        window.location.href = 'booking-success.html';
      }, 700);
    });
  }
}
