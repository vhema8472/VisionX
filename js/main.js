/* ==========================================
   WORKHUB - MAIN GLOBAL JAVASCRIPT & AUTH GUARD
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAuthStateGuard();
  initNavigation();
  initMobileMenu();
  initNewsletterForm();
  initScrollTopButton();
  initRedirectToast();
});

// Auth Guard & Navbar Dynamic UI Behavior
function initAuthStateGuard() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' && !!token;
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // List of Protected Pages requiring Login Authentication
  const protectedPages = ['profile.html', 'booking-history.html', 'booking-details.html', 'notifications.html', 'booking.html', 'payment.html'];

  // Protection Guard: If unauthenticated user attempts direct access to protected page
  if (!isLoggedIn && protectedPages.includes(currentPath)) {
    sessionStorage.setItem('auth_redirect_toast', 'Please log in to continue.');
    window.location.href = 'login.html';
    return;
  }

  // Navbar Dynamic Actions Update
  const headerActions = document.querySelector('.header-actions');
  if (headerActions) {
    if (isLoggedIn) {
      // User Logged In: Show Profile link / Avatar + Logout, Hide Login/Register
      const userData = JSON.parse(localStorage.getItem('workhub_user_session') || '{}');
      const avatarUrl = userData.avatarUrl || userData.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
      const userName = userData.name || userData.firstName || 'Member';

      headerActions.innerHTML = `
        <a href="workspace.html" class="btn btn-primary btn-sm">Book a Desk</a>
        <a href="profile.html" class="user-profile-btn" title="View Profile" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; font-weight: 600;">
          <img src="${avatarUrl}" alt="${userName}" class="avatar-sm" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">
          <span class="user-name-text">${userName}</span>
        </a>
        <button type="button" class="btn btn-secondary btn-sm" id="nav-logout-btn">Logout</button>
        <button class="mobile-toggle" aria-label="Toggle navigation menu">☰</button>
      `;

      // Attach logout event
      const logoutBtn = document.getElementById('nav-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', handleGlobalLogout);
      }
    } else {
      // User Not Logged In: Show Login & Register, Hide Profile
      headerActions.innerHTML = `
        <a href="workspace.html" class="btn btn-primary btn-sm">Book a Desk</a>
        <a href="login.html" class="btn btn-secondary btn-sm" id="auth-nav-link">Log In</a>
        <a href="register.html" class="btn btn-outline btn-sm">Register</a>
        <button class="mobile-toggle" aria-label="Toggle navigation menu">☰</button>
      `;
    }
  }
}

// Global Logout Action
async function handleGlobalLogout() {
  if (window.API && window.API.logoutUser) {
    try { await API.logoutUser(); } catch(e){}
  }
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('workhub_user_session');
  localStorage.removeItem('token');
  sessionStorage.clear();

  showToast('Logged out successfully.', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// Toast notification for redirect alerts (e.g. "Please login to access your profile.")
function initRedirectToast() {
  const redirectMsg = sessionStorage.getItem('auth_redirect_toast');
  if (redirectMsg) {
    showToast(redirectMsg, 'error');
    sessionStorage.removeItem('auth_redirect_toast');
  }
}

// Highlight active page link in Navbar
function initNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (
      href === currentPath || 
      (currentPath === '' && href === 'index.html') ||
      (currentPath.includes('membership') && href === 'membership.html') ||
      (currentPath.includes('workspace') && href === 'workspace.html') ||
      (currentPath.includes('booking') && href === 'booking.html' && !currentPath.includes('membership-booking'))
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Mobile Hamburger Menu Toggle
function initMobileMenu() {
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (toggleBtn && navMenu) {
      navMenu.classList.toggle('is-active');
      toggleBtn.setAttribute('aria-expanded', navMenu.classList.contains('is-active'));
      return;
    }

    if (navMenu && navMenu.classList.contains('is-active')) {
      if (e.target.closest('.nav-link') || !e.target.closest('.site-header')) {
        navMenu.classList.remove('is-active');
      }
    }
  });
}

// Footer Newsletter Handler
function initNewsletterForm() {
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim() !== '') {
        showToast('Thank you for subscribing to WorkHub newsletter!', 'success');
        emailInput.value = '';
      }
    });
  }
}

// Scroll To Top Floating Button Component
function initScrollTopButton() {
  let btn = document.querySelector('.scroll-top-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Global Loading Spinner Overlay Helpers
function showLoading() {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠️'}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
