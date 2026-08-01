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
        { id: 'BK-9901', user: 'Alex Johnson', arrivalTime: '09:00 AM', date: '2026-08-01', duration: 'Full Day', workspaceType: 'Dedicated Desk', space: 'Desk #03', status: 'Active' },
        { id: 'BK-9902', user: 'Sophia Taylor', arrivalTime: '10:30 AM', date: '2026-08-01', duration: '4 Hours', workspaceType: 'Private Cabin', space: 'Cabin A', status: 'Active' },
        { id: 'BK-9903', user: 'James Wilson', arrivalTime: '01:00 PM', date: '2026-08-01', duration: '2 Hours', workspaceType: 'Meeting Room', space: 'Room 102', status: 'Reserved' },
        { id: 'BK-9904', user: 'David Chen', arrivalTime: '02:15 PM', date: '2026-08-01', duration: 'Full Day', workspaceType: 'Hot Desk', space: 'Desk #01', status: 'Scheduled' },
        { id: 'BK-9905', user: 'Sarah Miller', arrivalTime: '03:45 PM', date: '2026-08-01', duration: '3 Hours', workspaceType: 'Private Cabin', space: 'Cabin B', status: 'Active' }
      ];
      localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(initialBookings));
    }

    // Seed initial settings
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      const initialSettings = {
        platformName: 'WorkHub Admin',
        supportEmail: 'support@workhub.com',
        companyName: 'WorkHub Workspace Systems Inc.',
        phone: '+1 800-555-WORK',
        address: '100 Innovation Way, Suite 400, San Francisco, CA',
        twoFactor: true,
        sessionTimeout: '30',
        emailNotifications: true,
        smsNotifications: false,
        theme: 'light',
        language: 'English',
        timezone: 'America/Los_Angeles'
      };
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(initialSettings));
    }
  },

  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

WorkHubStore.init();

// --------------------------------------------------------------------------
// 2. AUTHENTICATION GUARD
// --------------------------------------------------------------------------
function checkAuth(isLoginPage = false) {
  const authUser = localStorage.getItem(WorkHubStore.KEYS.AUTH_USER);
  if (isLoginPage) {
    if (authUser) {
      window.location.href = 'dashboard.html';
    }
  } else {
    if (!authUser) {
      window.location.href = 'login.html';
    }
  }
}

function logoutAdmin() {
  localStorage.removeItem(WorkHubStore.KEYS.AUTH_USER);
  showToast('Logging out...', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// --------------------------------------------------------------------------
// 3. TOAST NOTIFICATION SYSTEM
// --------------------------------------------------------------------------
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✓';
  if (type === 'error') icon = '✕';
  if (type === 'warning') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `
    <span style="font-weight:700; font-size:1.1rem;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
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

// Close modal when clicking on overlay background
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// --------------------------------------------------------------------------
// 5. CUSTOM ZERO-DEPENDENCY HTML5 CANVAS CHART RENDERER
// --------------------------------------------------------------------------
const WorkHubCharts = {
  renderBarChart(canvasId, labels, data, barColor = '#2563EB') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Auto resolution scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;
    
    ctx.clearRect(0, 0, width, height);

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
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.65;

    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, width, height);

    data.forEach((val, i) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
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
