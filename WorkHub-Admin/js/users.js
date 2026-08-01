/* ==========================================================================
   WORKHUB ADMIN - USER MANAGEMENT CONTROLLER (users.js)
   ========================================================================== */

let usersData = [];
let filteredUsers = [];
let currentPage = 1;
const pageSize = 5;
let currentSortColumn = 'name';
let sortDirection = 'asc';
let selectedUserIdForDelete = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  loadUsersData();
  bindUserEvents();
});

async function loadUsersData() {
  usersData = WorkHubStore.get(WorkHubStore.KEYS.USERS);
  try {
    const res = await fetch('http://localhost:5000/api/admin/users');
    const data = await res.json();
    if (data.success && Array.isArray(data.users) && data.users.length > 0) {
      usersData = data.users.map(u => ({
        id: u.userId || u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || '+1 (555) 012-3456',
        role: u.role === 'admin' ? 'Admin' : 'Member',
        membership: 'Professional',
        status: 'Active',
        joined: new Date(u.createdAt || Date.now()).toLocaleDateString()
      }));
    }
  } catch (e) {}

  updateUserMetrics();
  applyFiltersAndRender();
}

function updateUserMetrics() {
  document.getElementById('metric-total-users').textContent = 673;
  document.getElementById('metric-new-users').textContent = 10;
  document.getElementById('metric-premium-users').textContent = 123;
  document.getElementById('metric-inactive-users').textContent = 56;
}

function applyFiltersAndRender() {
  const searchVal = document.getElementById('user-search-input')?.value.toLowerCase().trim() || '';
  const roleFilter = document.getElementById('user-role-filter')?.value || 'ALL';
  const statusFilter = document.getElementById('user-status-filter')?.value || 'ALL';

  filteredUsers = usersData.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchVal) ||
                          u.email.toLowerCase().includes(searchVal) ||
                          u.phone.toLowerCase().includes(searchVal);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort
  filteredUsers.sort((a, b) => {
    let valA = a[currentSortColumn]?.toString().toLowerCase() || '';
    let valB = b[currentSortColumn]?.toString().toLowerCase() || '';
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  renderUsersTable();
}

function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filteredUsers.slice(startIndex, startIndex + pageSize);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:2rem;">No matching users found.</td></tr>`;
  } else {
    tbody.innerHTML = pageData.map(u => `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar">${u.avatar || u.name.charAt(0)}</div>
            <div>
              <div class="font-semibold">${u.name}</div>
              <div class="text-muted" style="font-size:0.75rem;">${u.id}</div>
            </div>
          </div>
        </td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td><span class="badge ${u.role === 'Admin' ? 'badge-info' : 'badge-secondary'}">${u.role}</span></td>
        <td><span class="badge badge-premium">${u.plan}</span></td>
        <td><span class="badge badge-${u.status.toLowerCase()}">${u.status}</span></td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-secondary btn-sm btn-icon-only" onclick="editUserPrompt('${u.id}')" title="Edit User">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon-only" onclick="confirmDeleteUser('${u.id}')" title="Delete User">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Update Pagination Info
  document.getElementById('user-table-info').textContent = 
    `Showing ${total === 0 ? 0 : startIndex + 1} to ${Math.min(startIndex + pageSize, total)} of ${total} users`;

  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const controls = document.getElementById('user-pagination-controls');
  if (!controls) return;

  let html = `<button class="page-num-btn" onclick="changeUserPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>❮</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-num-btn ${i === currentPage ? 'active' : ''}" onclick="changeUserPage(${i})">${i}</button>`;
  }
  html += `<button class="page-num-btn" onclick="changeUserPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>❯</button>`;
  controls.innerHTML = html;
}

function changeUserPage(page) {
  currentPage = page;
  renderUsersTable();
}

function bindUserEvents() {
  document.getElementById('user-search-input')?.addEventListener('input', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('user-role-filter')?.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
  document.getElementById('user-status-filter')?.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });

  // Add User Form Submission
  document.getElementById('add-user-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('add-user-name').value;
    const email = document.getElementById('add-user-email').value;
    const phone = document.getElementById('add-user-phone').value;
    const role = document.getElementById('add-user-role').value;
    const plan = document.getElementById('add-user-plan').value;

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      phone,
      role,
      plan,
      status: 'Active',
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    usersData.unshift(newUser);
    WorkHubStore.set(WorkHubStore.KEYS.USERS, usersData);
    closeModal('add-user-modal');
    showToast('New user added successfully!', 'success');
    loadUsersData();
  });

  // Export CSV
  document.getElementById('btn-export-users-csv')?.addEventListener('click', () => {
    let csv = 'ID,Name,Email,Phone,Role,Membership,Status\n';
    filteredUsers.forEach(u => {
      csv += `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.role}","${u.plan}","${u.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'WorkHub_Users_Export.csv');
    a.click();
    showToast('Users exported to CSV', 'info');
  });
}

function editUserPrompt(id) {
  const user = usersData.find(u => u.id === id);
  if (!user) return;

  document.getElementById('edit-user-id').value = user.id;
  document.getElementById('edit-user-name').value = user.name;
  document.getElementById('edit-user-email').value = user.email;
  document.getElementById('edit-user-phone').value = user.phone;
  document.getElementById('edit-user-role').value = user.role;
  document.getElementById('edit-user-plan').value = user.plan;
  document.getElementById('edit-user-status').value = user.status;

  openModal('edit-user-modal');
}

function saveEditedUser() {
  const id = document.getElementById('edit-user-id').value;
  const user = usersData.find(u => u.id === id);
  if (user) {
    user.name = document.getElementById('edit-user-name').value;
    user.email = document.getElementById('edit-user-email').value;
    user.phone = document.getElementById('edit-user-phone').value;
    user.role = document.getElementById('edit-user-role').value;
    user.plan = document.getElementById('edit-user-plan').value;
    user.status = document.getElementById('edit-user-status').value;

    WorkHubStore.set(WorkHubStore.KEYS.USERS, usersData);
    closeModal('edit-user-modal');
    showToast('User details updated!', 'success');
    loadUsersData();
  }
}

function confirmDeleteUser(id) {
  selectedUserIdForDelete = id;
  openModal('delete-user-modal');
}

function executeDeleteUser() {
  if (!selectedUserIdForDelete) return;
  usersData = usersData.filter(u => u.id !== selectedUserIdForDelete);
  WorkHubStore.set(WorkHubStore.KEYS.USERS, usersData);
  closeModal('delete-user-modal');
  showToast('User deleted permanently', 'warning');
  selectedUserIdForDelete = null;
  loadUsersData();
}
