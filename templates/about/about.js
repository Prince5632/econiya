/* ═══════════════════════════════════════════════════════════════════════
   ECONIYA — ABOUT US PAGE JS  (paste into CMS → JS field)
   ═══════════════════════════════════════════════════════════════════════ */

// Animated counter for stats
(function () {
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var duration = 2000;
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out quad
            var eased = 1 - (1 - progress) * (1 - progress);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var counters = entry.target.querySelectorAll('[data-count]');
                counters.forEach(animateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    var statsEl = document.querySelector('.ab-hero-stats');
    if (statsEl) observer.observe(statsEl);
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

    var selectors = '.ab-mv-card, .ab-tl-card, .ab-value-card';
    document.querySelectorAll(selectors).forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease ' + (i * 0.08) + 's, transform 0.6s ease ' + (i * 0.08) + 's';
        observer.observe(el);
    });
})();
