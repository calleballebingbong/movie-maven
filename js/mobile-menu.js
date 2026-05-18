// mobile menu
(function () {
    const HAMBURGER_SELECTOR = '.hamburger';
    const NAV_SELECTOR = '.header-main-nav';

    const hamburger = document.querySelector(HAMBURGER_SELECTOR);
    const nav = document.querySelector(NAV_SELECTOR);

    if (!hamburger || !nav) return;

    // Initialize aria attribute
    hamburger.setAttribute('aria-controls', NAV_SELECTOR.replace('.', ''));
    hamburger.setAttribute('aria-expanded', nav.classList.contains('mobile-open') ? 'true' : 'false');

    function openMenu() {
        nav.classList.add('mobile-open');
        hamburger.setAttribute('aria-expanded', 'true');
        // prevent background scroll on mobile when menu open
        document.body.style.overflow = 'hidden';
        const firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus();
    }

    function closeMenu() {
        nav.classList.remove('mobile-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
    }

    function toggleMenu() {
        if (nav.classList.contains('mobile-open')) closeMenu(); else openMenu();
    }

    // Click on hamburger toggles menu
    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && !hamburger.contains(e.target) && nav.classList.contains('mobile-open')) {
            closeMenu();
        }
    });

    // Close on Esc key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            if (nav.classList.contains('mobile-open')) {
                closeMenu();
            }
        }
    });

    // Close when a navigation link is clicked (navigate)
    nav.addEventListener('click', function (e) {
        const target = e.target;
        if (target && target.tagName === 'A' && nav.classList.contains('mobile-open')) {
            closeMenu();
        }
    });
})();