/* ==========================================================================
   WORKHUB ADMIN - MEMBERSHIP MANAGEMENT CONTROLLER (membership.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  loadMembershipMetrics();
  loadMembersTable();
  loadRenewalsList();
});

function loadMembershipMetrics() {
  document.getElementById('mb-total-members').textContent = 673;
  document.getElementById('mb-premium-members').textContent = 123;
  document.getElementById('mb-expiring-soon').textContent = 23;
  document.getElementById('mb-revenue').textContent = '$18,450.00';
}

function openAddMembershipModal() {
  openModal('add-membership-plan-modal');
}

function submitAddMembershipPlan() {
  const planName = document.getElementById('new-plan-name')?.value || 'Custom Tier';
  closeModal('add-membership-plan-modal');
  showToast(`New membership plan "${planName}" created successfully!`, 'success');
}

function loadMembersTable() {
  const users = WorkHubStore.get(WorkHubStore.KEYS.USERS);
  const tbody = document.getElementById('membership-tbody');
  if (!tbody) return;

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <div class="avatar">${u.avatar}</div>
          <span class="font-semibold">${u.name}</span>
        </div>
      </td>
      <td><span class="badge badge-info">${u.plan}</span></td>
      <td>2026-01-15</td>
      <td>2026-12-31</td>
      <td><span class="badge badge-${u.status.toLowerCase()}">${u.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="triggerRenew('${u.name}')">Renew</button>
      </td>
    </tr>
  `).join('');
}

function loadRenewalsList() {
  const renewalsList = document.getElementById('renewals-list');
  if (!renewalsList) return;

  const sampleRenewals = [
    { name: 'Alex Johnson', plan: 'Enterprise', date: 'In 3 days', price: '$499' },
    { name: 'Emily Davis', plan: 'Basic', date: 'In 5 days', price: '$99' },
    { name: 'Michael Brown', plan: 'Professional', date: 'In 7 days', price: '$199' }
  ];

  renewalsList.innerHTML = sampleRenewals.map(r => `
    <div class="flex items-center justify-between p-3 border-b" style="border-color:var(--border-color);">
      <div>
        <div class="font-semibold" style="font-size:0.9rem;">${r.name}</div>
        <div class="text-muted" style="font-size:0.78rem;">${r.plan} Plan • ${r.date}</div>
      </div>
      <div class="text-right">
        <div class="font-bold text-primary">${r.price}</div>
        <button class="btn btn-sm btn-primary" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="triggerRenew('${r.name}')">Send Reminder</button>
      </div>
    </div>
  `).join('');
}

function triggerRenew(userName) {
  showToast(`Renewal notification sent to ${userName}`, 'success');
}

function triggerIssueCoupon() {
  openModal('issue-coupon-modal');
}

function submitCoupon() {
  const code = document.getElementById('coupon-code').value || 'WORKHUB20';
  closeModal('issue-coupon-modal');
  showToast(`Discount coupon "${code}" issued successfully!`, 'success');
}

function openPolicyEditor() {
  openModal('policy-editor-modal');
}

function savePolicy() {
  closeModal('policy-editor-modal');
  showToast('Membership policy updated!', 'success');
}
