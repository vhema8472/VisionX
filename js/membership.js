/* ==========================================
   WORKHUB - MEMBERSHIP PAGE JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordion();
  initPlanSelection();
});

// FAQ Accordion expand/collapse
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all items
        faqItems.forEach(i => i.classList.remove('open'));

        // Toggle clicked item
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

// Handle Select Plan action
function initPlanSelection() {
  const selectBtns = document.querySelectorAll('.btn-select-plan');
  selectBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const planName = btn.dataset.plan || 'Selected Plan';
      showToast(`Redirecting to checkout for ${planName}...`, 'success');
      setTimeout(() => {
        window.location.href = 'membership-booking.html';
      }, 1000);
    });
  });
}
