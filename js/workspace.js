/* ==========================================
   WORKHUB - SIMPLIFIED WORKSPACE DISCOVERY JAVASCRIPT
   ========================================== */

let currentWorkspaces = [];
let itemsToShow = 6;

document.addEventListener('DOMContentLoaded', async () => {
  initFacilityFilterPills();
  initViewToggle();
  initSearchAndFilters();
  await loadWorkspaces();
});

// Load workspaces using REST API Placeholder
async function loadWorkspaces() {
  showLoading();
  try {
    const filters = getFilterValues();
    const res = await API.fetchWorkspaces(filters);
    currentWorkspaces = res.data || [];
    renderWorkspaces();
  } catch (err) {
    showToast('Failed to load workspace inventory.', 'error');
  } finally {
    hideLoading();
  }
}

// Extract filter control values from DOM
function getFilterValues() {
  return {
    search: document.getElementById('search-input')?.value.trim() || '',
    type: document.getElementById('filter-type')?.value || 'all',
    location: document.getElementById('filter-location')?.value || 'all',
    price: document.getElementById('filter-price')?.value || 'all',
    status: document.getElementById('filter-status')?.value || 'all',
    sort: document.getElementById('filter-sort')?.value || 'recommended'
  };
}

// Render Simplified Workspace Cards (Single Action Button)
function renderWorkspaces() {
  const container = document.getElementById('workspace-cards-container');
  const loadMoreBtn = document.getElementById('btn-load-more');
  if (!container) return;

  if (currentWorkspaces.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No workspaces found</h3>
        <p class="empty-state-desc">Try changing your search keywords or resetting filters.</p>
        <button type="button" class="btn btn-primary btn-sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  const visibleList = currentWorkspaces.slice(0, itemsToShow);

  container.innerHTML = visibleList.map(ws => {
    let badgeClass = 'badge-available';
    let btnText = 'Book Now';
    let isDisabled = false;

    switch (ws.statusType) {
      case 'partially-booked':
        badgeClass = 'badge-booked';
        btnText = 'Check Availability';
        break;
      case 'currently-occupied':
        badgeClass = 'badge-booked';
        btnText = 'Check Availability';
        break;
      case 'fully-booked':
        badgeClass = 'badge-occupied';
        btnText = 'Choose Another Date';
        break;
      case 'unavailable':
        badgeClass = 'badge-occupied';
        btnText = 'Unavailable';
        isDisabled = true;
        break;
      case 'available':
      default:
        badgeClass = 'badge-available';
        btnText = 'Book Now';
    }

    return `
      <article class="ws-item-card" data-id="${ws.id}" data-type="${ws.type}">
        <div class="ws-item-thumb">
          <img src="${ws.image}" alt="${ws.name}" loading="lazy" decoding="async">
          <span class="badge ${badgeClass} ws-status-badge">${ws.status}</span>
        </div>
        <div class="ws-item-content">
          <div class="ws-item-header">
            <h3 class="ws-item-title">${ws.name}</h3>
            <span class="ws-item-price">$${ws.hourlyPrice} <small>/hr</small></span>
          </div>
          <p class="ws-item-subloc">📍 ${ws.hubName || ws.location} • ⭐ ${ws.rating}</p>
          <p class="ws-item-desc">${ws.description || ''}</p>
          
          <div class="ws-availability-note">
            ${ws.availabilityNote || ''}
          </div>

          <div class="ws-tags-row">
            ${(ws.amenities || ['Wi-Fi', 'Power']).map(a => `<span class="ws-tag">✓ ${a}</span>`).join('')}
          </div>

          <div class="ws-item-actions">
            ${isDisabled ? `
              <button type="button" class="btn btn-primary btn-block" disabled style="opacity:0.6; cursor:not-allowed;">${btnText}</button>
            ` : `
              <button type="button" class="btn btn-primary btn-block" onclick="handleBookNow('${ws.id}')">${btnText}</button>
            `}
          </div>
        </div>
      </article>
    `;
  }).join('');

  if (loadMoreBtn) {
    if (itemsToShow < currentWorkspaces.length) {
      loadMoreBtn.style.display = 'inline-flex';
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }
}

// Live Search & Filter Binding
function initSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  const typeSelect = document.getElementById('filter-type');
  const locSelect = document.getElementById('filter-location');
  const priceSelect = document.getElementById('filter-price');
  const statusSelect = document.getElementById('filter-status');
  const sortSelect = document.getElementById('filter-sort');
  const resetBtn = document.getElementById('btn-reset-filters');
  const loadMoreBtn = document.getElementById('btn-load-more');

  if (searchInput) searchInput.addEventListener('input', debounce(loadWorkspaces, 300));
  if (typeSelect) typeSelect.addEventListener('change', loadWorkspaces);
  if (locSelect) locSelect.addEventListener('change', loadWorkspaces);
  if (priceSelect) priceSelect.addEventListener('change', loadWorkspaces);
  if (statusSelect) statusSelect.addEventListener('change', loadWorkspaces);
  if (sortSelect) sortSelect.addEventListener('change', loadWorkspaces);

  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      itemsToShow += 3;
      renderWorkspaces();
    });
  }
}

// Reset Filters Action
function resetFilters() {
  const searchInput = document.getElementById('search-input');
  const typeSelect = document.getElementById('filter-type');
  const locSelect = document.getElementById('filter-location');
  const priceSelect = document.getElementById('filter-price');
  const statusSelect = document.getElementById('filter-status');
  const sortSelect = document.getElementById('filter-sort');

  if (searchInput) searchInput.value = '';
  if (typeSelect) typeSelect.value = 'all';
  if (locSelect) locSelect.value = 'all';
  if (priceSelect) priceSelect.value = 'all';
  if (statusSelect) statusSelect.value = 'all';
  if (sortSelect) sortSelect.value = 'recommended';

  itemsToShow = 6;
  loadWorkspaces();
  showToast('Filters reset.', 'success');
}

// Single Primary Action: Direct Redirection to booking.html?id=WS001
function handleBookNow(id) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const ws = currentWorkspaces.find(w => w.id === id) || WorkHubData.workspaces[0];
  sessionStorage.setItem('selectedWorkspace', JSON.stringify(ws));

  if (!isLoggedIn) {
    sessionStorage.setItem('auth_redirect_toast', 'Please login to book a workspace.');
    window.location.href = 'login.html';
  } else {
    window.location.href = `booking.html?id=${id}`;
  }
}

// Debounce helper for smooth live typing search
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Toggle facility pills
function initFacilityFilterPills() {
  const pills = document.querySelectorAll('.facility-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      loadWorkspaces();
    });
  });
}

// View mode toggle (Grid vs Floor Plan)
function initViewToggle() {
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(`Switched view layout`, 'success');
    });
  });
}
