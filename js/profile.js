/* ==========================================
   WORKHUB - PROFILE DASHBOARD JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initProfileForm();
  initPasswordUpdate();
  initNotificationToggles();
});

// Save Profile Changes
function initProfileForm() {
  const saveBtn = document.getElementById('btn-save-profile');
  if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const updatedProfile = {
        firstName: document.getElementById('prof-firstname')?.value || "Sarah",
        lastName: document.getElementById('prof-lastname')?.value || "Jenkins",
        email: document.getElementById('prof-email')?.value || "sarah.jenkins@cloudscale.ai",
        phone: document.getElementById('prof-phone')?.value || "+1 (555) 982-1044",
        dob: document.getElementById('prof-dob')?.value || "1992-05-24",
        address: document.getElementById('prof-address')?.value || "",
        city: document.getElementById('prof-city')?.value || "",
        state: document.getElementById('prof-state')?.value || "",
        postalCode: document.getElementById('prof-postal')?.value || "",
        country: document.getElementById('prof-country')?.value || ""
      };

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const response = await API.updateProfile(updatedProfile);
        if (response.success) {
          showToast('Profile updated successfully!', 'success');
        }
      } catch (err) {
        showToast('Failed to update profile.', 'error');
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
    updatePassBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const currPass = document.getElementById('current-password')?.value;
      const newPass = document.getElementById('new-password')?.value;

      if (!currPass || !newPass) {
        showToast('Please fill out password fields.', 'error');
        return;
      }

      showToast('Password updated successfully!', 'success');
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
    });
  }
}

// Notification Toggles
function initNotificationToggles() {
  const toggles = document.querySelectorAll('.notif-row input[type="checkbox"]');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      showToast('Notification preference saved.', 'success');
    });
  });
}
