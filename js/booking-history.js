/* ==========================================
   WORKHUB - BOOKING HISTORY JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initHistoryTabs();
  await loadAndRenderHistory('all');
});

function initHistoryTabs() {
  const tabs = document.querySelectorAll('.history-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter || 'all';
      await loadAndRenderHistory(filter);
    });
  });
}

async function loadAndRenderHistory(filter) {
  const container = document.getElementById('history-cards-container');
  if (!container) return;

  showLoading();
  try {
    const res = await API.getBookingHistory();
    let bookings = res.data || [];

    if (filter !== 'all') {
      bookings = bookings.filter(b => b.status.toLowerCase() === filter.toLowerCase());
    }

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📂</div>
          <h3 class="empty-state-title">No ${filter === 'all' ? '' : filter} bookings found</h3>
          <p class="empty-state-desc">You don't have any ${filter} workspace reservations yet.</p>
          <a href="workspace.html" class="btn btn-primary btn-sm">Book a Workspace</a>
        </div>
      `;
    } else {
      container.innerHTML = bookings.map(b => `
        <div class="history-card-item">
          <div class="history-card-icon">${b.type === 'desk' ? '🏢' : '🛡️'}</div>
          <div class="history-card-details">
            <h3>
              ${b.title || b.workspaceName || 'Workspace Booking'}
              <span class="badge badge-${b.status.toLowerCase() === 'active' ? 'available' : b.status.toLowerCase() === 'completed' ? 'pro' : 'occupied'}">${b.status}</span>
            </h3>
            <div class="history-card-meta">
              <span>🆔 Ref: <strong>${b.bookingId}</strong></span>
              <span>📅 Date: <strong>${b.bookingDate}</strong></span>
              <span>⏱️ Time: <strong>${b.timeSlot || 'Full Day'}</strong></span>
            </div>
          </div>
          <div class="history-card-actions">
            <span class="history-card-price">${b.totalAmount || '$74.00'}</span>
            <div style="display:flex; gap:0.5rem;">
              <a href="booking-details.html?id=${b.bookingId}" class="btn btn-secondary btn-sm">View Details</a>
              ${b.status === 'Active' ? `<button class="btn btn-outline btn-sm" onclick="handleCancelBooking('${b.bookingId}')">Cancel</button>` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    showToast('Failed to load booking history.', 'error');
  } finally {
    hideLoading();
  }
}

async function handleCancelBooking(bookingId) {
  if (confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
    showLoading();
    try {
      await API.cancelBooking(bookingId);
      showToast(`Booking ${bookingId} cancelled successfully.`, 'success');
      const activeTab = document.querySelector('.history-tab-btn.active');
      await loadAndRenderHistory(activeTab ? activeTab.dataset.filter : 'all');
    } catch (e) {
      showToast('Error cancelling booking.', 'error');
    } finally {
      hideLoading();
    }
  }
}
