/* ==========================================
   WORKHUB - AUTHENTICATION INTERACTION JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initLoginForm();
  initRegisterForm();
  initGoogleSignInButton();
});

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

      showLoading();

      try {
        const response = await API.loginUser(email, pass);
        if (response.success) {
          showToast('Login successful! Redirecting to profile...', 'success');
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 800);
        }
      } catch (err) {
        showToast(err.message || 'Login failed.', 'error');
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

        const response = await API.registerUser({ firstName, lastName, email });
        if (response.success) {
          showToast('Account created successfully! Welcome to WorkHub.', 'success');
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 800);
        }
      } catch (err) {
        showToast('Registration failed. Please try again.', 'error');
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

      // If Google Client ID configured, redirect to Google OAuth URL
      const googleClientId = 'your-google-client-id-here.apps.googleusercontent.com';
      if (googleClientId && !googleClientId.includes('your-google-client-id')) {
        window.location.href = 'http://localhost:5000/api/auth/google';
        return;
      }

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
