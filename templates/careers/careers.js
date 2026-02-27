/* ═══════════════════════════════════════════════════════════════════════
   ECONIYA — CAREERS PAGE JS  (paste into CMS → JS field)
   ═══════════════════════════════════════════════════════════════════════ */

// Smooth scroll to openings
(function () {
    var heroBtn = document.querySelector('.cr-hero-btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
})();

// Scroll-in animations
(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    var selectors = '.cr-perk-card, .cr-job-card';
    document.querySelectorAll(selectors).forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease ' + (i * 0.08) + 's, transform 0.6s ease ' + (i * 0.08) + 's';
        observer.observe(el);
    });
})();
