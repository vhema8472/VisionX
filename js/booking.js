/* ==========================================
   WORKHUB - DYNAMIC ORDER & PRICE BREAKDOWN ENGINE
   ========================================== */

let activeWorkspace = null;

document.addEventListener('DOMContentLoaded', async () => {
  initBookingDateDefault();
  await loadWorkspace();
  initBookingListeners();
  updateOrderSummary();
});

// Set default date picker value to today's date dynamically and duration to 1 hour
function initBookingDateDefault() {
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (!dateInput.value || dateInput.value < todayStr) {
      dateInput.value = todayStr;
    }
    dateInput.min = todayStr;
  }

  const durationSelect = document.getElementById('booking-duration');
  if (durationSelect) {
    durationSelect.value = '1';
  }

  const userNameInput = document.getElementById('booking-user-name');
  if (userNameInput && !userNameInput.value.trim()) {
    const sessUser = JSON.parse(localStorage.getItem('workhub_user_session') || '{}');
    if (sessUser.name) userNameInput.value = sessUser.name;
  }
}

// Reset booking form helper
window.resetBookingForm = function() {
  const dateInput = document.getElementById('booking-date');
  const durationSelect = document.getElementById('booking-duration');
  const startTimeSelect = document.getElementById('start-time');
  const requestInput = document.getElementById('special-request');

  if (dateInput) {
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = todayStr;
  }
  if (durationSelect) durationSelect.value = '1';
  if (startTimeSelect) startTimeSelect.value = '10:00';
  if (requestInput) requestInput.value = '';

  updateOrderSummary();
};

// 1. Load Workspace by URL parameter or sessionStorage
async function loadWorkspace() {
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get('id');

  let ws = null;
  const stored = sessionStorage.getItem('selectedWorkspace');
  if (stored) {
    try { ws = JSON.parse(stored); } catch(e){}
  }

  if ((!ws || (idParam && ws.id !== idParam)) && idParam) {
    try {
      const res = await API.getWorkspaceById(idParam);
      if (res.success && res.data) ws = res.data;
    } catch(e){}
  }

  if (!ws) {
    ws = WorkHubData.workspaces[4] || WorkHubData.workspaces[0]; // Executive Private Cabin P-12 fallback
  }

  activeWorkspace = ws;
  sessionStorage.setItem('selectedWorkspace', JSON.stringify(ws));

  // Render Preview Sidebar Elements
  const imgElem = document.getElementById('preview-img');
  const titleElem = document.getElementById('preview-name');
  const typeLocElem = document.getElementById('preview-type-loc');
  const priceElem = document.getElementById('preview-hourly-price');
  const capElem = document.getElementById('preview-capacity');
  const statusElem = document.getElementById('preview-status');
  const amenitiesElem = document.getElementById('preview-amenities');

  if (imgElem && ws.image) imgElem.src = ws.image;
  if (titleElem) titleElem.textContent = ws.name;
  if (typeLocElem) typeLocElem.textContent = `🏢 ${ws.typeLabel || ws.type} • ${ws.hubName || ws.location}`;
  if (priceElem) priceElem.textContent = `$${ws.hourlyPrice.toFixed(2)} / hour`;
  if (capElem) capElem.textContent = ws.capacity || '1 Person';
  if (statusElem) {
    statusElem.textContent = ws.status;
    statusElem.className = `badge ${ws.statusType === 'available' ? 'badge-available' : ws.statusType === 'partially-booked' ? 'badge-booked' : 'badge-occupied'} preview-badge`;
  }
  if (amenitiesElem && ws.amenities) {
    amenitiesElem.innerHTML = ws.amenities.map(a => `<span class="amenity-chip">✓ ${a}</span>`).join('');
  }
}

// 2. Event Listeners for Real-time Calculation
function initBookingListeners() {
  const dateInput = document.getElementById('booking-date');
  const startTimeSelect = document.getElementById('start-time');
  const durationSelect = document.getElementById('booking-duration');
  const confirmBtn = document.getElementById('btn-confirm-booking');

  if (dateInput) dateInput.addEventListener('change', updateOrderSummary);
  if (startTimeSelect) startTimeSelect.addEventListener('change', updateOrderSummary);
  if (durationSelect) durationSelect.addEventListener('change', updateOrderSummary);

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleConfirmBookingSubmit);
  }
}

// 3. Central Dispatcher: Update Order Summary in Real Time
async function updateOrderSummary() {
  if (!activeWorkspace) return;

  const dateInput = document.getElementById('booking-date');
  const todayStr = new Date().toISOString().split('T')[0];
  const dateStr = (dateInput && dateInput.value) ? dateInput.value : todayStr;

  const startTime = document.getElementById('start-time')?.value || '10:00';
  const duration = parseInt(document.getElementById('booking-duration')?.value || '1', 10);

  // 1. Calculate End Time
  const rangeInfo = calculateEndTime(startTime, duration);

  // Update Time Range Display Box
  const endTimeDisplay = document.getElementById('end-time-display');
  if (endTimeDisplay) {
    endTimeDisplay.textContent = `${rangeInfo.startFormatted} – ${rangeInfo.endFormatted} (${duration} ${duration === 1 ? 'Hour' : 'Hours'})`;
  }

  // 2. Dynamic Price Calculations
  const hourlyRate = activeWorkspace.hourlyPrice || 45.00;
  const subtotal = calculateSubtotal(hourlyRate, duration);
  const serviceFee = calculateServiceFee(subtotal);
  const totalPayable = calculateTotal(subtotal, serviceFee);

  // 3. Update DOM Order Breakdown Values
  const summaryWsName = document.getElementById('summary-ws-name');
  const summaryRange = document.getElementById('summary-time-range');
  const summaryDuration = document.getElementById('summary-duration');
  const summaryRate = document.getElementById('summary-hourly-rate');
  const summarySubtotal = document.getElementById('summary-base-price');
  const summaryTaxes = document.getElementById('summary-taxes');
  const summaryTotal = document.getElementById('summary-total-amount');

  if (summaryWsName) summaryWsName.textContent = activeWorkspace.name;
  if (summaryRange) summaryRange.textContent = `${dateStr} (${rangeInfo.startFormatted} – ${rangeInfo.endFormatted})`;
  if (summaryDuration) summaryDuration.textContent = `${duration} ${duration === 1 ? 'Hour' : 'Hours'}`;
  if (summaryRate) summaryRate.textContent = `$${hourlyRate.toFixed(2)} / hour`;
  if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (summaryTaxes) summaryTaxes.textContent = `$${serviceFee.toFixed(2)}`;
  if (summaryTotal) summaryTotal.textContent = `$${totalPayable.toFixed(2)}`;

  // 4. Continuous Multi-Hour Availability Check
  const checkRes = await checkAvailability(activeWorkspace.id, dateStr, startTime, duration);
  
  const feedbackBox = document.getElementById('availability-feedback-box');
  const confirmBtn = document.getElementById('btn-confirm-booking');

  if (checkRes.isAvailable) {
    if (feedbackBox) {
      feedbackBox.innerHTML = `
        <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: var(--radius-md); padding: 0.85rem; color: #166534; font-weight: 700; font-size: 0.9rem;">
          ✅ Available for ${duration} ${duration === 1 ? 'hour' : 'hours'} (${rangeInfo.startFormatted} – ${rangeInfo.endFormatted})
        </div>
      `;
    }
    if (confirmBtn) confirmBtn.disabled = false;
  } else {
    // Continuous availability broken -> Render rejection & suggested alternative slots
    const alternatives = await findAlternativeSlots(activeWorkspace.id, dateStr, duration);
    const altHtml = alternatives.map(alt => `
      <button type="button" class="btn btn-outline btn-sm" 
              style="background:white; border-color:var(--primary); color:var(--primary); font-size:0.75rem; font-weight:700;" 
              onclick="selectAlternativeSlot('${alt.startTime}', ${alt.duration})">
        🟢 ${alt.display}
      </button>
    `).join('');

    if (feedbackBox) {
      feedbackBox.innerHTML = `
        <div style="background: #FFF5F5; border: 1px solid #FCA5A5; border-radius: var(--radius-md); padding: 0.85rem; color: var(--status-occupied);">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.35rem;">
            ❌ This workspace is not available for the selected ${duration}-hour duration (${rangeInfo.startFormatted} – ${rangeInfo.endFormatted}).
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem;">
            The workspace is booked for part of this time range. Please select an available alternative:
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${altHtml.length > 0 ? altHtml : '<span style="font-size:0.8rem; font-weight:600;">No continuous slots of this duration available today. Try reducing duration or choosing another date.</span>'}
          </div>
        </div>
      `;
    }
    if (confirmBtn) confirmBtn.disabled = true;
  }
}

// Reusable Modular Helpers Required by API Specification
function calculateEndTime(startTime24, durationHours) {
  const [h, m] = startTime24.split(':').map(Number);
  const startTotalMins = h * 60 + m;
  const endTotalMins = startTotalMins + durationHours * 60;

  const endH = Math.floor(endTotalMins / 60);
  const endM = endTotalMins % 60;

  const format24 = (hour, min) => `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  const format12 = (hour, min) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${String(min).padStart(2, '0')} ${period}`;
  };

  return {
    start24: startTime24,
    end24: format24(endH, endM),
    startFormatted: format12(h, m),
    endFormatted: format12(endH, endM)
  };
}

function calculateSubtotal(hourlyRate, durationHours) {
  return hourlyRate * durationHours;
}

function calculateServiceFee(subtotal) {
  return subtotal * 0.10;
}

function calculateTotal(subtotal, serviceFee) {
  return subtotal + serviceFee;
}

// Continuous availability checker
async function checkAvailability(workspaceId, dateStr, startTime, durationHours) {
  const res = await API.getWorkspaceAvailability(workspaceId, dateStr);
  const schedule = res.schedule || [];

  const startHour = parseInt(startTime.split(':')[0], 10);

  for (let i = 0; i < durationHours; i++) {
    const currentSegmentHour = startHour + i;
    const slot = schedule.find(s => {
      const sH = parseInt(s.start.split(':')[0], 10);
      const eH = parseInt(s.end.split(':')[0], 10);
      return currentSegmentHour >= sH && currentSegmentHour < eH;
    });

    if (!slot || slot.status === 'booked') {
      return { isAvailable: false };
    }
  }

  return { isAvailable: true };
}

// Find alternative continuous slots
async function findAlternativeSlots(workspaceId, dateStr, durationHours) {
  const res = await API.getWorkspaceAvailability(workspaceId, dateStr);
  const schedule = res.schedule || [];
  const alternatives = [];

  const possibleStartHours = [9, 10, 11, 12, 13, 14, 15, 16];

  for (const startH of possibleStartHours) {
    if (startH + durationHours > 18) continue;

    let isContinuous = true;
    for (let i = 0; i < durationHours; i++) {
      const segH = startH + i;
      const slot = schedule.find(s => {
        const sH = parseInt(s.start.split(':')[0], 10);
        const eH = parseInt(s.end.split(':')[0], 10);
        return segH >= sH && segH < eH;
      });
      if (!slot || slot.status === 'booked') {
        isContinuous = false;
        break;
      }
    }

    if (isContinuous) {
      const range = calculateEndTime(`${String(startH).padStart(2, '0')}:00`, durationHours);
      alternatives.push({
        startTime: `${String(startH).padStart(2, '0')}:00`,
        duration: durationHours,
        display: `${range.startFormatted} – ${range.endFormatted}`
      });

      if (alternatives.length >= 3) break;
    }
  }

  return alternatives;
}

// Global helper when alternative chip is clicked
window.selectAlternativeSlot = function(startTime, duration) {
  const startSelect = document.getElementById('start-time');
  const durationSelect = document.getElementById('booking-duration');

  if (startSelect) startSelect.value = startTime;
  if (durationSelect) durationSelect.value = duration;

  updateOrderSummary();
  showToast(`Applied alternative slot: ${startTime}`, 'success');
};

// 4. Final Availability Check & Save Booking Payload to sessionStorage
async function handleConfirmBookingSubmit(e) {
  e.preventDefault();

  if (!activeWorkspace) return;

  const userNameInput = document.getElementById('booking-user-name');
  const enteredUserName = userNameInput ? userNameInput.value.trim() : '';

  if (!enteredUserName) {
    showToast('Please enter your name.', 'error');
    if (userNameInput) {
      userNameInput.focus();
      userNameInput.style.borderColor = 'var(--status-occupied)';
    }
    return;
  } else if (userNameInput) {
    userNameInput.style.borderColor = 'var(--border-color)';
  }

  const dateInput = document.getElementById('booking-date');
  const todayStr = new Date().toISOString().split('T')[0];
  const dateStr = (dateInput && dateInput.value) ? dateInput.value : todayStr;

  const startTime = document.getElementById('start-time')?.value || '10:00';
  const duration = parseInt(document.getElementById('booking-duration')?.value || '1', 10);

  const rangeInfo = calculateEndTime(startTime, duration);
  const subtotal = calculateSubtotal(activeWorkspace.hourlyPrice, duration);
  const serviceFee = calculateServiceFee(subtotal);
  const totalPayable = calculateTotal(subtotal, serviceFee);

  showLoading();

  // Final Safety Check
  const checkRes = await checkAvailability(activeWorkspace.id, dateStr, startTime, duration);
  hideLoading();

  if (!checkRes.isAvailable) {
    showToast('❌ Sorry! This workspace was just booked by another user for the selected time range.', 'error');
    updateOrderSummary();
    return;
  }

  const sessUser = JSON.parse(localStorage.getItem('workhub_user_session') || '{}');

  // Save Booking Payload with EXACT required fields for payment.html
  const checkoutData = {
    type: 'desk',
    deskId: activeWorkspace.workspaceId || activeWorkspace.id || 'D-101',
    workspaceId: activeWorkspace.id || activeWorkspace.workspaceId || 'WS-001',
    workspaceName: activeWorkspace.name,
    workspaceType: activeWorkspace.typeLabel || activeWorkspace.type,
    location: activeWorkspace.hubName || activeWorkspace.location,
    date: dateStr,
    bookingDate: dateStr,
    startTime: rangeInfo.startFormatted,
    endTime: rangeInfo.endFormatted,
    timeRange: `${rangeInfo.startFormatted} – ${rangeInfo.endFormatted}`,
    duration: `${duration} ${duration === 1 ? 'Hour' : 'Hours'}`,
    durationHours: duration,
    hourlyRate: `$${activeWorkspace.hourlyPrice.toFixed(2)}`,
    subtotal: `$${subtotal.toFixed(2)}`,
    taxes: `$${serviceFee.toFixed(2)}`,
    totalAmount: `$${totalPayable.toFixed(2)}`,
    userName: enteredUserName,
    userEmail: sessUser.email || ''
  };

  sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));

  showToast('Booking validated! Redirecting to payment checkout...', 'success');
  setTimeout(() => {
    window.location.href = 'payment.html';
  }, 600);
}
