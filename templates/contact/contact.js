/* ═══════════════════════════════════════════════════════════════════════
   ECONIYA — CONTACT PAGE JS  (paste into CMS → JS field)
   ═══════════════════════════════════════════════════════════════════════ */

// FAQ toggle
function toggleFaq(btn) {
    var item = btn.closest('[data-faq]');
    var allItems = document.querySelectorAll('[data-faq]');
    allItems.forEach(function (el) {
        if (el !== item) el.classList.remove('open');
    });
    item.classList.toggle('open');
}

// Contact form handler
(function () {
    var form = document.getElementById('contactForm');
    var successEl = document.getElementById('ct-success');
    var submitBtn = document.getElementById('ct-submit-btn');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Simulate sending
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';

        setTimeout(function () {
            form.style.display = 'none';
            successEl.style.display = 'block';
        }, 1200);
    });
})();

// Animate elements on scroll
(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.ct-info-card, .ct-form-card, .ct-faq-item').forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
})();
