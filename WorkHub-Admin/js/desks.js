/* ==========================================================================
   WORKHUB ADMIN - DESK & WORKSPACE MANAGEMENT CONTROLLER (desks.js)
   ========================================================================== */

let desksData = [];
let selectedDeskForAction = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  loadDesksData();
  bindDeskEvents();
});

function loadDesksData() {
  desksData = WorkHubStore.get(WorkHubStore.KEYS.DESKS);
  if (!desksData || desksData.length !== 100) {
    desksData = [];
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

      desksData.push({
        id: `DSK-${numStr}`,
        number: `D-${numStr}`,
        zone: zone,
        type: type,
        capacity: type === 'Meeting Room' ? 10 : type === 'Private Cabin' ? 4 : 1,
        price: price,
        status: status
      });
    }
    WorkHubStore.set(WorkHubStore.KEYS.DESKS, desksData);
  }
  updateDeskMetrics();
  renderDeskGridVisualizer();
  renderDesksTable();
}

function updateDeskMetrics() {
  const total = desksData.length;
  const available = desksData.filter(d => d.status === 'Available').length;
  const occupied = desksData.filter(d => d.status === 'Occupied').length;
  const reserved = desksData.filter(d => d.status === 'Reserved').length;
  const maintenance = desksData.filter(d => d.status === 'Maintenance').length;

  document.getElementById('desk-total').textContent = total;
  document.getElementById('desk-available').textContent = available;
  document.getElementById('desk-occupied').textContent = occupied;
  document.getElementById('desk-reserved').textContent = reserved;
  document.getElementById('desk-maintenance').textContent = maintenance;
}

function renderDeskGridVisualizer() {
  const gridContainer = document.getElementById('desk-floor-grid');
  if (!gridContainer) return;

  const statusFilter = document.getElementById('desk-grid-filter')?.value || 'ALL';

  const itemsToRender = desksData.filter(d => statusFilter === 'ALL' || d.status === statusFilter);

  gridContainer.innerHTML = itemsToRender.map(d => `
    <div class="desk-item-card desk-${d.status.toLowerCase()}" onclick="inspectDesk('${d.id}')">
      <div style="font-size:1.5rem;">${getDeskIcon(d.type)}</div>
      <div class="desk-num">${d.number}</div>
      <div class="desk-type-tag">${d.type}</div>
      <span class="badge badge-${d.status.toLowerCase()}">${d.status}</span>
    </div>
  `).join('');
}

function getDeskIcon(type) {
  if (type === 'Hot Desk') return '💻';
  if (type === 'Dedicated Desk') return '🖥️';
  if (type === 'Private Cabin') return '🏢';
  if (type === 'Meeting Room') return '🤝';
  return '🪑';
}

function renderDesksTable() {
  const tbody = document.getElementById('desks-tbody');
  if (!tbody) return;

  tbody.innerHTML = desksData.map(d => `
    <tr>
      <td><strong>${d.number}</strong></td>
      <td>${d.type}</td>
      <td>${d.zone}</td>
      <td>${d.capacity} Person(s)</td>
      <td>$${d.price}/hr</td>
      <td><span class="badge badge-${d.status.toLowerCase()}">${d.status}</span></td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="reserveDeskModal('${d.id}')">Reserve</button>
          <button class="btn btn-secondary btn-sm" onclick="toggleDeskStatus('${d.id}')">Toggle Status</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function bindDeskEvents() {
  document.getElementById('desk-grid-filter')?.addEventListener('change', () => {
    renderDeskGridVisualizer();
  });
}

function inspectDesk(id) {
  const desk = desksData.find(d => d.id === id);
  if (!desk) return;

  selectedDeskForAction = desk;
  document.getElementById('inspect-desk-title').textContent = `${desk.number} Details`;
  document.getElementById('inspect-desk-info').innerHTML = `
    <p><strong>Type:</strong> ${desk.type}</p>
    <p><strong>Zone:</strong> ${desk.zone}</p>
    <p><strong>Capacity:</strong> ${desk.capacity} Person(s)</p>
    <p><strong>Rate:</strong> $${desk.price}/hour</p>
    <p><strong>Current Status:</strong> <span class="badge badge-${desk.status.toLowerCase()}">${desk.status}</span></p>
  `;
  openModal('inspect-desk-modal');
}

function reserveDeskModal(id) {
  const desk = desksData.find(d => d.id === id);
  if (!desk) return;
  selectedDeskForAction = desk;

  document.getElementById('reserve-desk-name').textContent = `${desk.number} (${desk.type})`;
  openModal('reserve-desk-modal');
}

function executeDeskReservation() {
  if (!selectedDeskForAction) return;

  const resUser = document.getElementById('reserve-user-name').value || 'Walk-in Customer';
  selectedDeskForAction.status = 'Reserved';

  // Record booking in store
  const bookings = WorkHubStore.get(WorkHubStore.KEYS.BOOKINGS);
  bookings.unshift({
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    user: resUser,
    space: selectedDeskForAction.number,
    duration: '2 Hours',
    date: new Date().toISOString().split('T')[0],
    status: 'Reserved'
  });
  WorkHubStore.set(WorkHubStore.KEYS.BOOKINGS, bookings);
  WorkHubStore.set(WorkHubStore.KEYS.DESKS, desksData);

  closeModal('reserve-desk-modal');
  showToast(`Reserved ${selectedDeskForAction.number} for ${resUser}!`, 'success');
  loadDesksData();
}

function toggleDeskStatus(id) {
  const desk = desksData.find(d => d.id === id);
  if (!desk) return;

  const statuses = ['Available', 'Occupied', 'Reserved', 'Maintenance'];
  const nextIdx = (statuses.indexOf(desk.status) + 1) % statuses.length;
  desk.status = statuses[nextIdx];

  WorkHubStore.set(WorkHubStore.KEYS.DESKS, desksData);
  showToast(`${desk.number} status updated to ${desk.status}`, 'info');
  loadDesksData();
}
