/* ==========================================================================
   WORKHUB ADMIN - PAYMENT MANAGEMENT CONTROLLER (payments.js)
   ========================================================================== */

let invoicesData = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  loadInvoicesData();
  renderPaymentCharts();
  bindPaymentEvents();
});

async function loadInvoicesData() {
  invoicesData = WorkHubStore.get(WorkHubStore.KEYS.INVOICES);
  try {
    const apiBase = window.ADMIN_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    const res = await fetch(`${apiBase}/api/admin/payments/recent`);
    const data = await res.json();
    if (data.success && Array.isArray(data.payments) && data.payments.length > 0) {
      invoicesData = data.payments.map(p => ({
        id: p.paymentId || p.transactionId,
        customer: p.userName || 'Customer',
        amount: typeof p.amount === 'number' ? `$${p.amount.toFixed(2)}` : p.amount,
        date: new Date(p.createdAt || Date.now()).toLocaleDateString(),
        method: p.paymentMethod || 'Credit Card',
        status: p.status === 'paid' ? 'Paid' : 'Pending'
      }));
    }
  } catch (e) {}

  renderInvoicesTable();
}

function renderPaymentCharts() {
  // Revenue Trend Chart
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const revValues = [14200, 18900, 22400, 21000, 26500, 29800];
  WorkHubCharts.renderBarChart('paymentTrendCanvas', months, revValues, '#10B981');

  // Payment Method Distribution Doughnut
  const methods = ['Credit Card', 'UPI', 'PayPal', 'Bank Transfer'];
  const counts = [45, 30, 15, 10];
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#06B6D4'];
  WorkHubCharts.renderDoughnutChart('paymentMethodCanvas', methods, counts, colors);
}

function renderInvoicesTable() {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;

  const searchVal = document.getElementById('invoice-search-input')?.value.toLowerCase().trim() || '';
  const statusFilter = document.getElementById('invoice-status-filter')?.value || 'ALL';

  const filtered = invoicesData.filter(inv => {
    const matchSearch = inv.id.toLowerCase().includes(searchVal) || inv.customer.toLowerCase().includes(searchVal);
    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  tbody.innerHTML = filtered.map(inv => `
    <tr>
      <td><strong>${inv.id}</strong></td>
      <td>${inv.customer}</td>
      <td><span class="font-bold text-primary">${inv.amount}</span></td>
      <td>${inv.date}</td>
      <td>${inv.method}</td>
      <td><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
      <td>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="viewInvoiceDetails('${inv.id}')">View</button>
          <button class="btn btn-primary btn-sm" onclick="downloadReceipt('${inv.id}')">Receipt</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function bindPaymentEvents() {
  document.getElementById('invoice-search-input')?.addEventListener('input', renderInvoicesTable);
  document.getElementById('invoice-status-filter')?.addEventListener('change', renderInvoicesTable);

  document.getElementById('btn-export-invoices-csv')?.addEventListener('click', () => {
    let csv = 'Invoice Number,Customer,Amount,Date,Payment Method,Status\n';
    invoicesData.forEach(inv => {
      csv += `"${inv.id}","${inv.customer}","${inv.amount}","${inv.date}","${inv.method}","${inv.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'WorkHub_Invoices.csv');
    a.click();
    showToast('Invoices exported to CSV', 'info');
  });
}

function viewInvoiceDetails(id) {
  const inv = invoicesData.find(i => i.id === id);
  if (!inv) return;

  document.getElementById('inv-detail-id').textContent = inv.id;
  document.getElementById('inv-detail-content').innerHTML = `
    <div style="line-height:1.8;">
      <p><strong>Customer Name:</strong> ${inv.customer}</p>
      <p><strong>Billing Date:</strong> ${inv.date}</p>
      <p><strong>Payment Method:</strong> ${inv.method}</p>
      <p><strong>Total Amount:</strong> <span style="font-size:1.2rem; font-weight:800; color:var(--primary-blue);">${inv.amount}</span></p>
      <p><strong>Status:</strong> <span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></p>
    </div>
  `;
  openModal('invoice-modal');
}

function downloadReceipt(id) {
  showToast(`Receipt for ${id} generated & downloaded!`, 'success');
}
