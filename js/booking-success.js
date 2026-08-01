/* ==========================================
   WORKHUB - BOOKING SUCCESS & RECEIPT JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderBookingReceipt();
});

function renderBookingReceipt() {
  const confirmedData = sessionStorage.getItem('confirmedBooking');
  let b = null;
  if (confirmedData) {
    try { b = JSON.parse(confirmedData); } catch(e){}
  }

  if (!b) {
    b = {
      bookingId: "BK20260731-8F4K",
      workspaceName: "Executive Private Cabin P-12",
      deskType: "Private Cabin",
      location: "Downtown Executive Hub",
      bookingDate: "31 July 2026",
      timeSlot: "10:00 AM – 01:00 PM (3 Hours)",
      userName: "Sarah Jenkins",
      userEmail: "sarah.jenkins@cloudscale.ai",
      totalAmount: "$148.50",
      status: "Confirmed"
    };
  }

  // Render receipt items
  const idElem = document.getElementById('receipt-booking-id');
  const titleElem = document.getElementById('receipt-ws-title');
  const dateElem = document.getElementById('receipt-date');
  const timeElem = document.getElementById('receipt-time');
  const amountElem = document.getElementById('receipt-amount');
  const statusElem = document.getElementById('receipt-status');

  if (idElem) idElem.textContent = b.bookingId || "BK20260731-8F4K";
  if (titleElem) titleElem.textContent = b.workspaceName || b.title || "Executive Private Cabin P-12";
  if (dateElem) dateElem.textContent = b.bookingDate || b.date || "31 July 2026";
  if (timeElem) timeElem.textContent = b.timeSlot || b.timeRange || "10:00 AM – 01:00 PM (3 Hours)";
  if (amountElem) amountElem.textContent = b.totalAmount || "$148.50";
  if (statusElem) statusElem.textContent = b.status || "Confirmed";
}
