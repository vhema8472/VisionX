/* ==========================================================================
   WORKHUB ADMIN - CORE STATE STORE, UTILITIES & AUTH (main.js)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. LOCAL STORAGE MOCK DATA STORE
// --------------------------------------------------------------------------
const WorkHubStore = {
  // Key names
  KEYS: {
    AUTH_USER: 'workhub_admin_user',
    USERS: 'workhub_users_data',
    DESKS: 'workhub_desks_data',
    INVOICES: 'workhub_invoices_data',
    BOOKINGS: 'workhub_bookings_data',
    SETTINGS: 'workhub_settings_data',
    PLANS: 'workhub_plans_data'
  },

  init() {
    // Seed initial users if not present
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const initialUsers = [
        { id: 'USR-101', name: 'Alex Johnson', email: 'alex.j@example.com', phone: '+1 555-0192', role: 'Member', plan: 'Enterprise', status: 'Active', avatar: 'AJ' },
        { id: 'USR-102', name: 'Sarah Miller', email: 'sarah.m@example.com', phone: '+1 555-0143', role: 'Admin', plan: 'VIP', status: 'Active', avatar: 'SM' },
        { id: 'USR-103', name: 'David Chen', email: 'd.chen@example.com', phone: '+1 555-0188', role: 'Member', plan: 'Professional', status: 'Active', avatar: 'DC' },
        { id: 'USR-104', name: 'Emily Davis', email: 'emily.d@example.com', phone: '+1 555-0121', role: 'Member', plan: 'Basic', status: 'Pending', avatar: 'ED' },
        { id: 'USR-105', name: 'Michael Brown', email: 'm.brown@example.com', phone: '+1 555-0165', role: 'Member', plan: 'Professional', status: 'Inactive', avatar: 'MB' },
        { id: 'USR-106', name: 'Sophia Taylor', email: 'sophia.t@example.com', phone: '+1 555-0199', role: 'Member', plan: 'Enterprise', status: 'Active', avatar: 'ST' },
        { id: 'USR-107', name: 'James Wilson', email: 'j.wilson@example.com', phone: '+1 555-0177', role: 'Member', plan: 'VIP', status: 'Active', avatar: 'JW' }
      ];
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(initialUsers));
    }

    // Seed initial desks (100 desks: 25 Available, 57 Occupied, 16 Reserved, 2 Maintenance)
    if (!localStorage.getItem(this.KEYS.DESKS) || JSON.parse(localStorage.getItem(this.KEYS.DESKS)).length !== 100) {
      const initialDesks = [];
      const types = ['Hot Desk', 'Dedicated Desk', 'Private Cabin', 'Meeting Room'];
      const zones = ['Quiet Zone', 'Main Hall', 'Private Wing', 'Meeting Hub'];

      for (let i = 1; i <= 100; i++) {
        const numStr = i.toString().padStart(3, '0');
        let status = 'Available';
        if (i > 25 && i <= 82) status = 'Occupied';      // 57 occupied
        else if (i > 82 && i <= 98) status = 'Reserved'; // 16 reserved
        else if (i > 98) status = 'Maintenance';         // 2 maintenance

        const type = types[i % types.length];
        const zone = zones[i % zones.length];
        const price = type === 'Hot Desk' ? 15 : type === 'Dedicated Desk' ? 25 : type === 'Private Cabin' ? 80 : 150;

        initialDesks.push({
          id: `DSK-${numStr}`,
          number: `D-${numStr}`,
          zone: zone,
          type: type,
          capacity: type === 'Meeting Room' ? 10 : type === 'Private Cabin' ? 4 : 1,
          price: price,
          status: status
        });
      }
      localStorage.setItem(this.KEYS.DESKS, JSON.stringify(initialDesks));
    }

    // Seed initial invoices if not present
    if (!localStorage.getItem(this.KEYS.INVOICES)) {
      const initialInvoices = [
        { id: 'INV-2026-001', customer: 'Alex Johnson', amount: '$450.00', method: 'Credit Card', date: '2026-07-28', status: 'Paid' },
        { id: 'INV-2026-002', customer: 'Sarah Miller', amount: '$850.00', method: 'UPI', date: '2026-07-29', status: 'Paid' },
        { id: 'INV-2026-003', customer: 'David Chen', amount: '$250.00', method: 'PayPal', date: '2026-07-30', status: 'Paid' },
        { id: 'INV-2026-004', customer: 'Emily Davis', amount: '$120.00', method: 'Bank Transfer', date: '2026-07-31', status: 'Pending' },
        { id: 'INV-2026-005', customer: 'Michael Brown', amount: '$250.00', method: 'Credit Card', date: '2026-07-25', status: 'Failed' }
      ];
      localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(initialInvoices));
    }

    // Seed initial bookings with required fields (User Name, Arrival Time, Date, Duration, Workspace Type)
    if (!localStorage.getItem(this.KEYS.BOOKINGS) || !JSON.parse(localStorage.getItem(this.KEYS.BOOKINGS))[0]?.arrivalTime) {
      const initialBookings = [
        { id: 'BK-9901', user: 'Alex Johnson', arrivalTime: '09:00 AM', date: '2026-08-01', duration: '1 Hour', workspaceType: 'Dedicated Desk', space: 'Desk #03', status: 'Active' },
        { id: 'BK-9902', user: 'Sophia Taylor', arrivalTime: '10:30 AM', date: '2026-08-01', duration: '2 Hours', workspaceType: 'Private Cabin', space: 'Cabin A', status: 'Active' },
        { id: 'BK-9903', user: 'James Wilson', arrivalTime: '01:00 PM', date: '2026-08-01', duration: '1 Hour', workspaceType: 'Meeting Room', space: 'Room 102', status: 'Active' },
        { id: 'BK-9904', user: 'David Chen', arrivalTime: '02:15 PM', date: '2026-08-01', duration: '4 Hours', workspaceType: 'Hot Desk', space: 'Desk #01', status: 'Active' },
        { id: 'BK-9905', user: 'Sarah Miller', arrivalTime: '04:00 PM', date: '2026-08-01', duration: '1 Hour', workspaceType: 'Dedicated Desk', space: 'Desk #09', status: 'Active' }
      ];
      localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(initialBookings));
    }
  },

  get(key) {
    this.init();
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --------------------------------------------------------------------------
// 2. AUTHENTICATION HELPERS
// --------------------------------------------------------------------------
function checkAuth(redirectIfAuth = false) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem(WorkHubStore.KEYS.AUTH_USER) || 'null');
  const isAuth = !!token || (user && user.isLoggedIn);

  if (!isAuth && !redirectIfAuth) {
    window.location.href = 'login.html';
  } else if (isAuth && redirectIfAuth) {
    window.location.href = 'dashboard.html';
  }
}

function logoutAdmin() {
  localStorage.removeItem(WorkHubStore.KEYS.AUTH_USER);
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// --------------------------------------------------------------------------
// 3. TOAST NOTIFICATION SYSTEM
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    pointer-events: auto;
    padding: 12px 20px;
    border-radius: 8px;
    background: ${type === 'success' ? '#10B981' : type === 'danger' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#2563EB'};
    color: #ffffff;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: fadeIn 0.3s ease;
  `;
  
  const icon = type === 'success' ? '✓' : type === 'danger' ? '✕' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --------------------------------------------------------------------------
// 4. MODAL MANAGER
// --------------------------------------------------------------------------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// --------------------------------------------------------------------------
// 5. CUSTOM ZERO-DEPENDENCY HTML5 CANVAS CHART RENDERER
// --------------------------------------------------------------------------
const WorkHubCharts = {
  renderLineChart(canvasId, labels, data, lineColor = '#2563EB', fillColor = 'rgba(37, 99, 235, 0.12)') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const parent = canvas.parentElement;
    const width = Math.max(canvas.clientWidth || parent?.clientWidth || rect.width || 500, 300);
    const height = Math.max(canvas.clientHeight || parent?.clientHeight || rect.height || 280, 240);

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padding = 40;
    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No revenue data available', width / 2, height / 2);
      return;
    }

    const maxVal = Math.max(...data, 100);
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const stepX = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

    // Draw Gridlines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const valLabel = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${valLabel.toLocaleString()}`, padding - 6, y + 3);
    }

    // Points calculation
    const points = data.map((val, idx) => {
      const x = padding + idx * stepX;
      const y = height - padding - (val / maxVal) * chartHeight;
      return { x, y, val, label: labels[idx] };
    });

    // Fill Area
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, padding, 0, height - padding);
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke Line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Data Dots & Labels
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // X-Axis Label
      ctx.fillStyle = '#6B7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, height - padding + 18);
    });
  },

  renderBarChart(canvasId, labels, data, barColor = '#2563EB') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const parent = canvas.parentElement;
    const width = Math.max(canvas.clientWidth || parent?.clientWidth || rect.width || 500, 300);
    const height = Math.max(canvas.clientHeight || parent?.clientHeight || rect.height || 280, 240);

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padding = 40;
    ctx.clearRect(0, 0, width, height);

    if (!data || data.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No booking data available', width / 2, height / 2);
      return;
    }

    const maxVal = Math.max(...data, 10);
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = (chartWidth / data.length) * 0.5;
    const gap = (chartWidth / data.length) * 0.5;

    // Draw Axis lines & Grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      const valLabel = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${valLabel}`, padding - 6, y + 3);
    }

    // Draw Bars
    data.forEach((val, index) => {
      const x = padding + index * (barWidth + gap) + gap / 2;
      const bHeight = (val / maxVal) * chartHeight;
      const y = height - padding - bHeight;

      // Rounded Top Bar
      ctx.fillStyle = barColor;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, bHeight, [6, 6, 0, 0]);
      ctx.fill();

      // Label below bar
      ctx.fillStyle = '#6B7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 2, height - padding + 18);
    });
  },

  renderDoughnutChart(canvasId, labels, data, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(canvas.clientWidth || rect.width || 300, 200);
    const height = Math.max(canvas.clientHeight || rect.height || 300, 200);

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.65;

    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, width, height);

    data.forEach((val, i) => {
      const sliceAngle = total > 0 ? (val / total) * 2 * Math.PI : 0;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      startAngle = endAngle;
    });

    // Draw center total count
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 8);

    ctx.fillStyle = '#6B7280';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Total', centerX, centerY + 10);
  }
};

// --------------------------------------------------------------------------
// 6. UI INTERACTION BINDINGS
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Sidebar Drawer Toggle
  const sidebarToggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Profile Dropdown Toggle
  const profileTrigger = document.getElementById('profile-trigger');
  const profileDropdown = document.getElementById('profile-dropdown');
  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      profileDropdown.classList.remove('show');
    });
  }
});
