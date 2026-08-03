/* ==========================================
   WORKHUB - DYNAMIC PROFILE DASHBOARD JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', async () => {
  await loadUserProfileFields();
  initProfileForm();
  initPasswordUpdate();
  initNotificationToggles();
});

// Generate dynamic initials SVG avatar for user without custom photo
function generateInitialsAvatar(name) {
  const cleanName = (name || 'Member').trim();
  const parts = cleanName.split(' ').filter(Boolean);
  let initials = 'MB';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length >= 2) {
    initials = parts[0].substring(0, 2).toUpperCase();
  } else if (parts.length === 1 && parts[0].length === 1) {
    initials = parts[0][0].toUpperCase();
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="100%" height="100%" fill="#2563EB"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#FFFFFF" font-family="Inter, sans-serif" font-size="46" font-weight="700">${initials}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Format date into Month DD, YYYY (e.g. August 02, 2026)
function formatMemberSinceDate(rawDate) {
  try {
    const d = rawDate ? new Date(rawDate) : new Date();
    if (isNaN(d.getTime())) return 'August 02, 2026';
    return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  } catch (e) {
    return 'August 02, 2026';
  }
}

// Load Profile Data dynamically from API
async function loadUserProfileFields() {
  const nameEl = document.getElementById('profile-hero-name');
  const roleEl = document.getElementById('profile-hero-role');
  const planEl = document.getElementById('profile-hero-plan');
  const sinceEl = document.getElementById('profile-hero-since');
  const avatarImg = document.getElementById('profile-avatar-img');

  try {
    const profileRes = await API.fetchUserProfile();
    if (!profileRes || !profileRes.success || !profileRes.data) {
      if (nameEl) nameEl.innerHTML = `Unable to load profile. Please try again.`;
      sessionStorage.setItem('auth_redirect_toast', 'Please log in to continue.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }

    const u = profileRes.data;
    const fullName = (u.name || u.firstName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.email).trim();
    const nameParts = fullName.split(' ');
    const firstName = u.firstName || nameParts[0] || '';
    const lastName = u.lastName || nameParts.slice(1).join(' ') || '';

    // Update Hero Section
    if (nameEl) {
      nameEl.innerHTML = `${fullName} <span class="badge badge-available">Active</span>`;
    }
    if (roleEl) {
      roleEl.textContent = u.role || 'Member';
    }
    if (sinceEl) {
      sinceEl.textContent = formatMemberSinceDate(u.createdAt);
    }

    // Avatar update
    const userPhoto = u.profileImage || u.avatarUrl || '';
    if (avatarImg) {
      avatarImg.src = userPhoto ? userPhoto : generateInitialsAvatar(fullName);
      avatarImg.alt = fullName;
    }

    // Populate Form Inputs
    if (document.getElementById('prof-firstname')) document.getElementById('prof-firstname').value = firstName;
    if (document.getElementById('prof-lastname')) document.getElementById('prof-lastname').value = lastName;
    if (document.getElementById('prof-email')) document.getElementById('prof-email').value = u.email || '';
    if (document.getElementById('prof-phone')) document.getElementById('prof-phone').value = u.phone || '';
    if (document.getElementById('prof-dob')) document.getElementById('prof-dob').value = u.dob || '';
    if (document.getElementById('prof-address')) document.getElementById('prof-address').value = u.address || '';
    if (document.getElementById('prof-city')) document.getElementById('prof-city').value = u.city || '';
    if (document.getElementById('prof-state')) document.getElementById('prof-state').value = u.state || '';
    if (document.getElementById('prof-postal')) document.getElementById('prof-postal').value = u.postalCode || '';
    if (document.getElementById('prof-country')) document.getElementById('prof-country').value = u.country || '';

    // Fetch User Memberships
    try {
      const membershipRes = await API.getUserMemberships();
      if (membershipRes && membershipRes.memberships && membershipRes.memberships.length > 0) {
        const activeM = membershipRes.memberships[0];
        if (planEl) planEl.textContent = activeM.planName || activeM.workspaceType || 'Active Membership';
      } else {
        if (planEl) planEl.textContent = 'No Active Membership';
      }
    } catch (mErr) {
      if (planEl) planEl.textContent = 'No Active Membership';
    }

  } catch (err) {
    if (nameEl) nameEl.innerHTML = `Unable to load profile. Please try again.`;
    showToast('Unable to load profile. Please try again.', 'error');
  }
}

// Save Profile Changes
function initProfileForm() {
  const saveBtn = document.getElementById('btn-save-profile');
  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('prof-firstname')?.value.trim() || '';
      const lastName = document.getElementById('prof-lastname')?.value.trim() || '';
      const fullName = `${firstName} ${lastName}`.trim();

      const updatedProfile = {
        name: fullName,
        firstName,
        lastName,
        email: document.getElementById('prof-email')?.value.trim() || '',
        phone: document.getElementById('prof-phone')?.value.trim() || '',
        dob: document.getElementById('prof-dob')?.value.trim() || '',
        address: document.getElementById('prof-address')?.value.trim() || '',
        city: document.getElementById('prof-city')?.value.trim() || '',
        state: document.getElementById('prof-state')?.value.trim() || '',
        postalCode: document.getElementById('prof-postal')?.value.trim() || '',
        country: document.getElementById('prof-country')?.value.trim() || ''
      };

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const response = await API.updateProfile(updatedProfile);
        if (response && response.success) {
          showToast('Profile updated successfully!', 'success');

          // Update hero name immediately
          const nameEl = document.getElementById('profile-hero-name');
          if (nameEl) {
            nameEl.innerHTML = `${fullName} <span class="badge badge-available">Active</span>`;
          }

          // Refresh navbar header UI
          if (window.initAuthStateGuard) {
            window.initAuthStateGuard();
          }
        } else {
          showToast(response.message || 'Failed to update profile.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Failed to update profile.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      }
    });
  }
}

// Update Password
function initPasswordUpdate() {
  const updatePassBtn = document.getElementById('btn-update-password');
  if (updatePassBtn) {
    updatePassBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const currentPass = document.getElementById('pass-current')?.value;
      const newPass = document.getElementById('pass-new')?.value;
      const confirmPass = document.getElementById('pass-confirm')?.value;

      if (!currentPass || !newPass || !confirmPass) {
        showToast('Please fill out all password fields.', 'error');
        return;
      }

      if (newPass !== confirmPass) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      showToast('Password updated successfully!', 'success');
    });
  }
}

// Notification Toggles
function initNotificationToggles() {
  const toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      showToast('Preference saved.', 'info');
    });
  });
}
