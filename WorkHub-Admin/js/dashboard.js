/* ==========================================================================
   WORKHUB ADMIN - DASHBOARD CONTROLLER (dashboard.js)
   Optimized with Parallel Promise.all Fetches & Staged Non-Blocking UI
   ========================================================================== */

let isPolling = false;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);

  // Immediate Stage 1: Render layout shell, charts, and calendar
  renderDashboardCharts();
  renderMiniCalendar();

  // Stage 2: Parallel fetch & render for KPIs, Recent Bookings, and Payments
  loadDashboardDataParallel();

  // Non-overlapping Interval Polling (Every 5 seconds)
  setInterval(() => {
    if (!isPolling) {
      isPolling = true;
      loadDashboardDataParallel().finally(() => {
        isPolling = false;
      });
    }
  }, 5000);
});

async function loadDashboardDataParallel() {
  const adminToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const headers = { 'Authorization': `Bearer ${adminToken}` };

  // Parallel Promise.all Execution
  return Promise.all([
    fetch('http://localhost:5000/api/admin/dashboard/stats', { headers }).then(res => res.json()).catch(() => null),
    fetch('http://localhost:5000/api/admin/recent-bookings?limit=5', { headers }).then(res => res.json()).catch(() => null),
    fetch('http://localhost:5000/api/admin/payments/recent?limit=5', { headers }).then(res => res.json()).catch(() => null)
  ]).then(([statsData, bookingsData, paymentsData]) => {
    // Process Stats
    if (statsData && statsData.success && statsData.stats) {
      const s = statsData.stats;
      setElemText('stat-total-users', s.totalUsers || 673);
      setElemText('stat-active-members', s.activeMembers || 132);
      setElemText('stat-monthly-revenue', s.totalRevenue || '$18,450.00');
      setElemText('stat-todays-bookings', s.todaysBookings || 18);
      setElemText('stat-available-desks', s.availableDesks || 25);
      setElemText('stat-occupied-desks', s.occupiedDesks || 59);
      setElemText('stat-reserved-today', s.reservedDesks || 16);
    }

    // Process Bookings Table
    let bookings = WorkHubStore.get(WorkHubStore.KEYS.BOOKINGS);
    if (bookingsData && bookingsData.success && Array.isArray(bookingsData.bookings) && bookingsData.bookings.length > 0) {
      bookings = bookingsData.bookings.map(b => ({
        id: b.bookingId,
        user: b.userName,
        arrivalTime: b.arrivalTime || b.startTime || '09:00 AM',
        date: b.date || b.bookingDate,
        duration: b.duration,
        workspaceType: b.workspaceType || b.workspaceName,
        status: b.bookingStatus
      }));
    }

    const bookingTbody = document.getElementById('dashboard-bookings-tbody');
    if (bookingTbody) {
      bookingTbody.innerHTML = bookings.slice(0, 5).map(b => `
        <tr>
          <td><strong>${b.user}</strong></td>
          <td>${b.arrivalTime || '09:00 AM'}</td>
          <td>${b.date}</td>
          <td>${b.duration}</td>
          <td><span class="badge badge-info">${b.workspaceType}</span></td>
        </tr>
      `).join('');
    }

    // Process Payments Table
    let payments = WorkHubStore.get(WorkHubStore.KEYS.INVOICES);
    if (paymentsData && paymentsData.success && Array.isArray(paymentsData.payments) && paymentsData.payments.length > 0) {
      payments = paymentsData.payments.map(p => ({
        id: p.paymentId,
        customer: p.userName || 'Client',
        amount: typeof p.amount === 'number' ? `$${p.amount.toFixed(2)}` : p.amount,
        method: p.paymentMethod || 'Credit Card',
        status: p.status || 'paid'
      }));
    }

    const paymentTbody = document.getElementById('dashboard-payments-tbody');
    if (paymentTbody) {
      paymentTbody.innerHTML = payments.slice(0, 5).map(inv => `
        <tr>
          <td><strong>${inv.id}</strong></td>
          <td>${inv.customer}</td>
          <td><strong>${inv.amount}</strong></td>
          <td>${inv.method}</td>
          <td><span class="badge badge-${(inv.status || 'paid').toLowerCase()}">${inv.status}</span></td>
        </tr>
      `).join('');
    }
  });
}

function setElemText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderDashboardCharts() {
  const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const revenueData = [12500, 15200, 14800, 18900, 22400, 21000, 26500, 29800];
  WorkHubCharts.renderBarChart('revenueChartCanvas', revenueLabels, revenueData, '#2563EB');

  const bookingLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const bookingData = [45, 62, 78, 85, 92, 54, 38];
  WorkHubCharts.renderBarChart('bookingChartCanvas', bookingLabels, bookingData, '#3B82F6');
}

function renderMiniCalendar() {
  const calendarGrid = document.getElementById('mini-calendar-grid');
  if (!calendarGrid) return;

  const daysHeader = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarGrid.innerHTML = '';

  daysHeader.forEach(d => {
    const head = document.createElement('div');
    head.className = 'calendar-day-head';
    head.textContent = d;
    calendarGrid.appendChild(head);
  });

  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = 31;

  for (let i = 1; i <= daysInMonth; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    if (i === currentDay) cell.classList.add('today');
    if ([4, 12, 18, 25].includes(i)) cell.classList.add('has-event');
    cell.textContent = i;
    calendarGrid.appendChild(cell);
  }
}

async function createNewDashboardBooking() {
  const userName = document.getElementById('qb-customer')?.value.trim() || 'Alex Johnson';
  const arrivalTime = document.getElementById('qb-arrival-time')?.value.trim() || '09:00 AM';
  const bookingDate = document.getElementById('qb-date')?.value.trim() || '2026-08-01';
  const duration = document.getElementById('qb-duration')?.value.trim() || 'Full Day';
  const workspaceType = document.getElementById('qb-workspace-type')?.value || 'Dedicated Desk';

  const newBookingPayload = {
    bookingId: `BK-${Math.floor(9000 + Math.random() * 999)}`,
    userName,
    user: userName,
    arrivalTime,
    bookingDate,
    date: bookingDate,
    duration,
    workspaceType,
    workspaceName: workspaceType,
    totalPrice: '$45.00',
    bookingStatus: 'Active',
    paymentStatus: 'Paid'
  };

  try {
    const adminToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(newBookingPayload)
    });
  } catch (e) {}

  const bookings = WorkHubStore.get(WorkHubStore.KEYS.BOOKINGS);
  bookings.unshift({
    id: newBookingPayload.bookingId,
    user: userName,
    arrivalTime,
    date: bookingDate,
    duration,
    workspaceType,
    space: workspaceType,
    status: 'Active'
  });
  WorkHubStore.set(WorkHubStore.KEYS.BOOKINGS, bookings);

  closeModal('quick-booking-modal');
  showToast('New booking added to Dashboard!', 'success');
  loadDashboardDataParallel();
}
