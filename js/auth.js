/* ==========================================
   WORKHUB - AUTHENTICATION INTERACTION JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initLoginForm();
  initAdminLoginForm();
  initRegisterForm();
  initGoogleSignInButton();
  initAuthTabSwitching();
});

// Tab Switcher between Member Login and Admin Portal
function initAuthTabSwitching() {
  const userBtn = document.getElementById('tab-user-btn');
  const adminBtn = document.getElementById('tab-admin-btn');
  const userForm = document.getElementById('login-form');
  const adminForm = document.getElementById('admin-login-form');
  const socialSection = document.getElementById('social-auth-section');

  if (userBtn && adminBtn) {
    userBtn.addEventListener('click', () => {
      userBtn.classList.add('active');
      userBtn.style.background = '#ffffff';
      userBtn.style.color = '#111827';
      userBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

      adminBtn.classList.remove('active');
      adminBtn.style.background = 'transparent';
      adminBtn.style.color = '#6B7280';
      adminBtn.style.boxShadow = 'none';

      if (userForm) userForm.style.display = 'block';
      if (adminForm) adminForm.style.display = 'none';
      if (socialSection) socialSection.style.display = 'block';
    });

    adminBtn.addEventListener('click', () => {
      adminBtn.classList.add('active');
      adminBtn.style.background = '#111827';
      adminBtn.style.color = '#ffffff';
      adminBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

      userBtn.classList.remove('active');
      userBtn.style.background = 'transparent';
      userBtn.style.color = '#6B7280';
      userBtn.style.boxShadow = 'none';

      if (userForm) userForm.style.display = 'none';
      if (adminForm) adminForm.style.display = 'block';
      if (socialSection) socialSection.style.display = 'none';
    });
  }
}

// Admin Secret PIN Login Submit
function initAdminLoginForm() {
  const adminForm = document.getElementById('admin-login-form');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-login-email').value.trim();
      const pin = document.getElementById('admin-login-pin').value.trim();

      if (!email || !pin) {
        showToast('Please enter both Admin Email and Secret PIN.', 'error');
        return;
      }

      showLoading();

      try {
        const response = await API.adminLogin(email, pin);
        if (response.success) {
          showToast('Admin authentication successful! Accessing portal...', 'success');
          setTimeout(() => {
            window.location.href = 'WorkHub-Admin/dashboard.html';
          }, 800);
        } else {
          showToast(response.message || 'Invalid admin credentials.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Invalid admin credentials.', 'error');
      } finally {
        hideLoading();
      }
    });
  }
}

// Password Show / Hide Toggle
function initPasswordToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-password-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && input.type === 'password') {
        input.type = 'text';
        btn.textContent = '👁️‍🗨️';
      } else if (input) {
        input.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });
}

// Login Form Validation & Submit
function initLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value.trim();

      if (!email || !pass) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
      }

      showLoading();

      try {
        const response = await API.loginUser(email, pass);
        if (response && response.success) {
          showToast('Login successful! Welcome back.', 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 800);
        } else {
          showToast(response.message || 'Invalid email or password.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
          }
        }
      } catch (err) {
        showToast(err.message || 'Invalid email or password.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      } finally {
        hideLoading();
      }
    });
  }
}

// Register Form Validation & Submit
function initRegisterForm() {
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullname = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-password').value.trim();
      const confirmPass = document.getElementById('reg-confirm-password').value.trim();
      const terms = document.getElementById('reg-terms').checked;

      if (!fullname || !email || !pass || !confirmPass) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }

      if (pass.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      if (pass !== confirmPass) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      if (!terms) {
        showToast('You must agree to the Terms of Service.', 'error');
        return;
      }

      showLoading();

      try {
        const nameParts = fullname.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        const response = await API.registerUser({
          name: fullname,
          email: email,
          password: pass
        });

        if (response && response.success) {
          showToast('Account created successfully! Please log in with your credentials.', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1000);
        } else {
          showToast(response.message || 'Registration failed. Please try again.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Registration failed. Please try again.', 'error');
      } finally {
        hideLoading();
      }
    });
  }
}

// Google Sign-In Button Handler
function initGoogleSignInButton() {
  const googleBtns = document.querySelectorAll('.btn-google, .google-btn, .btn-social-google, [data-auth="google"]');
  googleBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      showLoading();
      try {
        const response = await API.googleSignInUser({
          email: 'google.user@workhub.io',
          name: 'Google WorkHub User',
          googleId: 'GOOG-901823901',
          profileImage: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
        });

        if (response.success) {
          showToast('Google Sign-In successful! Welcome to WorkHub.', 'success');
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 800);
        } else {
          showToast(response.message || 'Google Sign-In failed.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Google Sign-In failed.', 'error');
      } finally {
        hideLoading();
      }
    });
  });
}
