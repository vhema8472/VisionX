/* ==========================================
   WORKHUB - BOOKING DETAILS JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('id') || 'BK20260731-8F4K';
  
  showLoading();
  try {
    const res = await API.getBookingHistory();
    const history = res.data || [];
    const booking = history.find(b => b.bookingId === bookingId) || history[0];

    renderBookingDetails(booking);
  } catch (err) {
    showToast('Failed to load booking details.', 'error');
  } finally {
    hideLoading();
  }
});

function renderBookingDetails(b) {
  const titleElem = document.getElementById('details-title');
  const idElem = document.getElementById('details-id');
  const statusElem = document.getElementById('details-status');
  const locationElem = document.getElementById('details-location');
  const dateElem = document.getElementById('details-date');
  const timeElem = document.getElementById('details-time');
  const priceElem = document.getElementById('details-price');
  const nameElem = document.getElementById('details-user-name');
  const emailElem = document.getElementById('details-user-email');
  const payElem = document.getElementById('details-pay-method');

  if (titleElem) titleElem.textContent = b.title || b.workspaceName || 'Workspace Booking';
  if (idElem) idElem.textContent = b.bookingId;
  if (statusElem) {
    statusElem.textContent = b.status;
    statusElem.className = `badge badge-${b.status.toLowerCase() === 'active' ? 'available' : b.status.toLowerCase() === 'completed' ? 'pro' : 'occupied'}`;
  }
  if (locationElem) locationElem.textContent = b.location || 'Manhattan Hub, NY';
  if (dateElem) dateElem.textContent = b.bookingDate || 'July 31, 2026';
  if (timeElem) timeElem.textContent = b.timeSlot || 'Full Day';
  if (priceElem) priceElem.textContent = b.totalAmount || '$74.00';
  if (nameElem) nameElem.textContent = b.userName || 'Sarah Jenkins';
  if (emailElem) emailElem.textContent = b.userEmail || 'sarah.jenkins@cloudscale.ai';
  if (payElem) payElem.textContent = b.paymentMethod || 'Credit Card';

  const cancelBtn = document.getElementById('btn-cancel-this-booking');
  if (cancelBtn) {
    if (b.status !== 'Active') {
      cancelBtn.style.display = 'none';
    } else {
      cancelBtn.onclick = async () => {
        if (confirm(`Are you sure you want to cancel booking ${b.bookingId}?`)) {
          showLoading();
          await API.cancelBooking(b.bookingId);
          showToast('Booking cancelled.', 'success');
          setTimeout(() => window.location.reload(), 800);
        }
      };
    }
  }
}
