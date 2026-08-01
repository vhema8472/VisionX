/* ==========================================================================
   WORKHUB ADMIN - LOGIN CONTROLLER (login.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Guard check: redirect if already logged in
  checkAuth(true);

  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const loginErrorMsg = document.getElementById('login-error-msg');

  // Toggle Password visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  // Handle Login Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginErrorMsg.style.display = 'none';

      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      // Form validations
      if (!email) {
        showLoginError('Email address is required.');
        return;
      }

      if (!password) {
        showLoginError('Password is required.');
        return;
      }

      // Check Demo Credentials
      if (email === 'admin@workhub.com' && password === 'admin123') {
        const sessionUser = {
          name: 'WorkHub Admin',
          email: 'admin@workhub.com',
          role: 'Super Administrator',
          loginTime: new Date().toISOString()
        };

        localStorage.setItem(WorkHubStore.KEYS.AUTH_USER, JSON.stringify(sessionUser));
        showToast('Login successful! Redirecting to dashboard...', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 600);
      } else {
        showLoginError('Invalid Email or Password. Default: admin@workhub.com / admin123');
        showToast('Authentication failed', 'error');
      }
    });
  }

  function showLoginError(msg) {
    if (loginErrorMsg) {
      loginErrorMsg.textContent = msg;
      loginErrorMsg.style.display = 'block';
    }
  }
});
