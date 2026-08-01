/* ==========================================
   WORKHUB - MEMBERSHIP BOOKING JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPaymentRadioSelection();
  initCouponCode();
  initMembershipCheckoutForm();
});

// Toggle Payment Radio Selection (Credit Card vs PayPal)
function initPaymentRadioSelection() {
  const methodTiles = document.querySelectorAll('.payment-method-tile');
  const cardFieldsBox = document.getElementById('card-fields-box');

  methodTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      methodTiles.forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');

      const radio = tile.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const method = radio?.value;
      if (cardFieldsBox) {
        if (method === 'paypal') {
          cardFieldsBox.style.display = 'none';
        } else {
          cardFieldsBox.style.display = 'flex';
        }
      }
    });
  });
}

// Coupon Code Validation Handler
function initCouponCode() {
  const couponBtn = document.getElementById('btn-apply-coupon');
  const couponInput = document.getElementById('coupon-code-input');
  const totalValElem = document.getElementById('checkout-total-val');

  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = couponInput.value.trim().toUpperCase();

      if (code === 'WORKHUB20' || code === 'PROMO20') {
        showToast('Coupon WORKHUB20 applied! 20% discount added.', 'success');
        if (totalValElem) totalValElem.textContent = '$59.20';
        couponBtn.textContent = 'Applied ✓';
        couponBtn.disabled = true;
        couponInput.disabled = true;
      } else if (code === '') {
        showToast('Please enter a valid coupon code.', 'error');
      } else {
        showToast('Invalid coupon code. Try WORKHUB20', 'error');
      }
    });
  }
}

// Membership Checkout Form Submission -> Redirect to payment.html
function initMembershipCheckoutForm() {
  const submitBtn = document.getElementById('btn-complete-membership');

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Validate required fields
      const fullName = document.getElementById('checkout-fullname')?.value.trim();
      const email = document.getElementById('checkout-email')?.value.trim();
      const company = document.getElementById('checkout-company')?.value.trim() || '';
      const phone = document.getElementById('checkout-phone')?.value.trim() || '';
      const totalAmount = document.getElementById('checkout-total-val')?.textContent || "$74.00";

      if (!fullName || !email) {
        showToast('Please fill out your Full Name and Email Address.', 'error');
        return;
      }

      // Store pending checkout data in sessionStorage
      const checkoutData = {
        type: 'membership',
        title: 'Business Plan Membership',
        planName: 'Business Plan',
        duration: 'Monthly',
        billingCycle: 'Full monthly access',
        userName: fullName,
        userEmail: email,
        company: company,
        phone: phone,
        bookingDate: new Date().toLocaleDateString(),
        basePrice: '$69.00',
        tax: '$5.00',
        totalAmount: totalAmount
      };

      sessionStorage.setItem('pendingCheckout', JSON.stringify(checkoutData));

      showToast('Proceeding to payment...', 'success');
      setTimeout(() => {
        window.location.href = 'payment.html';
      }, 500);
    });
  }
}
