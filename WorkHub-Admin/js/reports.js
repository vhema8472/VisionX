/* ==========================================================================
   WORKHUB ADMIN - REPORTS & ANALYTICS CONTROLLER (reports.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  renderReportCharts();
});

function renderReportCharts() {
  // Revenue Analytics Canvas
  const months = ['Q1 Jan', 'Q1 Feb', 'Q1 Mar', 'Q2 Apr', 'Q2 May', 'Q2 Jun'];
  const rev = [32000, 38000, 41000, 48000, 52000, 61000];
  WorkHubCharts.renderBarChart('reportRevCanvas', months, rev, '#2563EB');

  // Space Occupancy Rate Canvas
  const zones = ['Main Hall', 'Quiet Zone', 'Private Wing', 'Meeting Hub'];
  const occupancy = [88, 75, 92, 64];
  WorkHubCharts.renderBarChart('reportOccupancyCanvas', zones, occupancy, '#10B981');

  // Revenue Sources Breakdown Doughnut
  const sources = ['Memberships', 'Desk Rentals', 'Meeting Rooms', 'Cafe Services'];
  const share = [50, 25, 15, 10];
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#06B6D4'];
  WorkHubCharts.renderDoughnutChart('reportSourcesCanvas', sources, share, colors);
}

function triggerGenerateReport(templateName) {
  showToast(`Generating ${templateName} report...`, 'info');
  setTimeout(() => {
    showToast(`${templateName} report ready!`, 'success');
  }, 1200);
}

function exportReport(format) {
  showToast(`Preparing ${format.toUpperCase()} export...`, 'info');
  setTimeout(() => {
    const a = document.createElement('a');
    a.href = '#';
    showToast(`WorkHub_Analytics_Report.${format.toLowerCase()} downloaded!`, 'success');
  }, 1000);
}
