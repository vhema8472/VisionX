/* ==========================================================================
   WORKHUB ADMIN - DASHBOARD CONTROLLER (dashboard.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof checkAuth === 'function') checkAuth(false);

  // Render Charts & Calendar
  renderDashboardCharts();
  renderMiniCalendar();

  // Load KPIs and Recent Tables
  loadDashboardKPIs();
  loadRecentTables();
});

function loadDashboardKPIs() {
  const totalUsers = 673;
  const activeMembers = 132;
  const availableDesks = 25;
  const occupiedDesks = 59;
  const reservedToday = 16;
  const todaysBookings = 18;
  const monthlyRevenue = '$18,450.00';

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
  if (window.WorkHubCharts) {
    WorkHubCharts.renderLineChart('revenueChartCanvas', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'], [12500, 15200, 14800, 18900, 22400, 21000, 26500, 29800], '#2563EB');
    WorkHubCharts.renderBarChart('bookingChartCanvas', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [45, 62, 78, 85, 92, 54, 38], '#3B82F6');
  }
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

function loadRecentTables() {
  const bookings = (typeof WorkHubStore !== 'undefined') ? WorkHubStore.get(WorkHubStore.KEYS.BOOKINGS) || [] : [];
  const bookingTbody = document.getElementById('dashboard-bookings-tbody');
  if (bookingTbody) {
    const displayBookings = bookings.length > 0 ? bookings : [
      { id: 'BK-1001', user: 'Sarah Miller', arrivalTime: '09:00 AM', space: 'Executive Hot Desk', duration: '2 Hours', workspaceType: 'Hot Desk' },
      { id: 'BK-1002', user: 'Alex Johnson', arrivalTime: '10:30 AM', space: 'Private Cabin C-04', duration: '1 Day', workspaceType: 'Private Cabin' },
      { id: 'BK-1003', user: 'David Chen', arrivalTime: '01:00 PM', space: 'Dedicated Desk D-12', duration: '4 Hours', workspaceType: 'Dedicated Desk' }
    ];

    bookingTbody.innerHTML = displayBookings.slice(0, 8).map(b => `
      <tr>
        <td><strong style="color:var(--primary); font-family:monospace;">${b.bookingId || b.id || 'BK-1001'}</strong></td>
        <td><strong>${b.userName || b.user || 'Member'}</strong></td>
        <td><span class="badge badge-subtle" style="font-weight:700;">${b.deskId || 'D-101'}</span></td>
        <td>${b.startTime || b.arrivalTime || '09:00 AM'}</td>
        <td>${b.date || b.bookingDate || new Date().toISOString().split('T')[0]}</td>
        <td>${b.duration || '1 Hour'}</td>
        <td><span class="badge badge-info">${b.workspaceType || b.space || 'Hot Desk'}</span></td>
      </tr>
    `).join('');
  }

  const paymentTbody = document.getElementById('dashboard-payments-tbody');
  if (paymentTbody) {
    const payments = [
      { id: 'PAY-8091', customer: 'Alex Johnson', amount: '$150.00', method: 'Credit Card', status: 'Completed' },
      { id: 'PAY-8092', customer: 'Sarah Miller', amount: '$299.00', method: 'PayPal', status: 'Completed' },
      { id: 'PAY-8093', customer: 'David Chen', amount: '$45.00', method: 'Credit Card', status: 'Completed' },
      { id: 'PAY-8094', customer: 'Emily Davis', amount: '$85.00', method: 'Stripe', status: 'Completed' }
    ];

    paymentTbody.innerHTML = payments.map(inv => `
      <tr>
        <td><strong>${inv.id}</strong></td>
        <td>${inv.customer}</td>
        <td><strong>${inv.amount}</strong></td>
        <td>${inv.method}</td>
        <td><span class="badge badge-success">${inv.status}</span></td>
      </tr>
    `).join('');
  }
}

function createNewDashboardBooking() {
  const userName = document.getElementById('qb-customer')?.value.trim();
  if (!userName) {
    if (window.showToast) showToast('User Name is required.', 'error');
    return;
  }
  const deskId = document.getElementById('qb-desk-id')?.value.trim() || 'D-205';
  const arrivalTime = document.getElementById('qb-arrival-time')?.value.trim() || '09:00 AM';
  const bookingDate = document.getElementById('qb-date')?.value.trim() || new Date().toISOString().split('T')[0];
  const duration = document.getElementById('qb-duration')?.value.trim() || '1 Hour';
  const workspaceType = document.getElementById('qb-workspace-type')?.value || 'Dedicated Desk';

  const newBooking = {
    id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
    user: userName,
    deskId,
    arrivalTime,
    date: bookingDate,
    duration,
    workspaceType,
    space: `${workspaceType} (${deskId})`,
    status: 'Active'
  };

  if (typeof WorkHubStore !== 'undefined') {
    const adminBookings = WorkHubStore.get(WorkHubStore.KEYS.BOOKINGS) || [];
    adminBookings.unshift(newBooking);
    WorkHubStore.set(WorkHubStore.KEYS.BOOKINGS, adminBookings);
  }

  if (window.showToast) showToast(`Booking ${newBooking.id} created for ${userName}!`, 'success');
  if (window.closeModal) closeModal('quick-booking-modal');
  loadRecentTables();
}
