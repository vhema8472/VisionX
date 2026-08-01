/* ==========================================================================
   WORKHUB ADMIN - DASHBOARD CONTROLLER (dashboard.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);

  // Load KPI Stats
  loadDashboardKPIs();

  // Render Canvas Charts
  renderDashboardCharts();

  // Render Mini Calendar & Activity Tables
  renderMiniCalendar();
  loadRecentTables();
});

async function loadDashboardKPIs() {
  let totalUsers = 673;
  let activeMembers = 132;
  let availableDesks = 25;
  let occupiedDesks = 59;
  let reservedToday = 16;
  let todaysBookings = 18;
  let monthlyRevenue = '$18,450.00';

  try {
    const res = await fetch('http://localhost:5000/api/admin/dashboard/stats');
    const data = await res.json();
    if (data.success && data.stats) {
      const s = data.stats;
      totalUsers = s.totalUsers || 673;
      activeMembers = s.activeMembers || 132;
      availableDesks = s.availableDesks || 25;
      occupiedDesks = s.occupiedDesks || 59;
      reservedToday = s.reservedDesks || 16;
      todaysBookings = s.todaysBookings || 18;
      if (s.totalRevenue) monthlyRevenue = s.totalRevenue;
    }
  } catch (e) {}

  // Render to DOM elements
  setElemText('stat-total-users', totalUsers);
  setElemText('stat-active-members', activeMembers);
  setElemText('stat-monthly-revenue', monthlyRevenue);
  setElemText('stat-todays-bookings', todaysBookings);
  setElemText('stat-available-desks', availableDesks);
  setElemText('stat-occupied-desks', occupiedDesks);
  setElemText('stat-reserved-today', reservedToday);
}

function setElemText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderDashboardCharts() {
  // Revenue Chart (Monthly)
  const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const revenueData = [12500, 15200, 14800, 18900, 22400, 21000, 26500, 29800];
  WorkHubCharts.renderBarChart('revenueChartCanvas', revenueLabels, revenueData, '#2563EB');

  // Booking Volume Chart (Weekly)
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

async function loadRecentTables() {
  let bookings = WorkHubStore.get(WorkHubStore.KEYS.BOOKINGS);

  // Fetch live bookings from Node.js + Express + MongoDB API
  try {
    const adminToken = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const res = await fetch('http://localhost:5000/api/admin/recent-bookings', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.bookings) && data.bookings.length > 0) {
      bookings = data.bookings.map(b => ({
        id: b.bookingId,
        user: b.userName,
        arrivalTime: b.arrivalTime,
        date: b.bookingDate,
        duration: b.duration,
        workspaceType: b.workspaceType,
        space: b.workspaceName,
        status: b.bookingStatus
      }));
    }
  } catch (e) {
    // Silent fallback to local storage
  }

  const bookingTbody = document.getElementById('dashboard-bookings-tbody');
  if (bookingTbody) {
    bookingTbody.innerHTML = bookings.slice(0, 5).map(b => `
      <tr>
        <td><strong>${b.user}</strong></td>
        <td>${b.arrivalTime || '09:00 AM'}</td>
        <td>${b.date}</td>
        <td>${b.duration}</td>
        <td><span class="badge badge-info">${b.workspaceType || b.space}</span></td>
      </tr>
    `).join('');
  }

  // Latest Payments Table
  const invoices = WorkHubStore.get(WorkHubStore.KEYS.INVOICES);
  const paymentTbody = document.getElementById('dashboard-payments-tbody');
  if (paymentTbody) {
    paymentTbody.innerHTML = invoices.slice(0, 5).map(inv => `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>${inv.customer}</td>
        <td><strong>${inv.amount}</strong></td>
        <td>${inv.method}</td>
        <td><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
      </tr>
    `).join('');
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
    await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  loadRecentTables();
}
