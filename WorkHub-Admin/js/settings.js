/* ==========================================================================
   WORKHUB ADMIN - SETTINGS CONTROLLER (settings.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth(false);
  loadSettingsForm();
  bindSettingsTabs();
});

function loadSettingsForm() {
  const settings = WorkHubStore.get(WorkHubStore.KEYS.SETTINGS);
  if (!settings) return;

  setInputValue('sett-platform-name', settings.platformName);
  setInputValue('sett-support-email', settings.supportEmail);
  setInputValue('sett-company-name', settings.companyName);
  setInputValue('sett-phone', settings.phone);
  setInputValue('sett-address', settings.address);
  setInputValue('sett-session-timeout', settings.sessionTimeout);
  setInputValue('sett-language', settings.language);
  setInputValue('sett-timezone', settings.timezone);

  setCheckboxChecked('sett-2fa', settings.twoFactor);
  setCheckboxChecked('sett-email-notif', settings.emailNotifications);
  setCheckboxChecked('sett-sms-notif', settings.smsNotifications);

  if (settings.theme === 'dark') {
    document.body.classList.add('dark-theme');
    setInputValue('sett-theme', 'dark');
  }
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

function setCheckboxChecked(id, checked) {
  const el = document.getElementById(id);
  if (el && checked !== undefined) el.checked = checked;
}

function bindSettingsTabs() {
  const navBtns = document.querySelectorAll('.settings-nav-btn');
  const panels = document.querySelectorAll('.settings-content-panel');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      navBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId)?.classList.add('active');
    });
  });
}

function saveSystemSettings() {
  const settings = {
    platformName: document.getElementById('sett-platform-name').value,
    supportEmail: document.getElementById('sett-support-email').value,
    companyName: document.getElementById('sett-company-name').value,
    phone: document.getElementById('sett-phone').value,
    address: document.getElementById('sett-address').value,
    twoFactor: document.getElementById('sett-2fa').checked,
    sessionTimeout: document.getElementById('sett-session-timeout').value,
    emailNotifications: document.getElementById('sett-email-notif').checked,
    smsNotifications: document.getElementById('sett-sms-notif').checked,
    theme: document.getElementById('sett-theme').value,
    language: document.getElementById('sett-language').value,
    timezone: document.getElementById('sett-timezone').value
  };

  WorkHubStore.set(WorkHubStore.KEYS.SETTINGS, settings);

  if (settings.theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  showToast('Settings saved successfully!', 'success');
}
