// assets/js/main.js
class AnitechWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollAnimations();
        this.setupHolidayBanner();
        this.setupTestimonials();
        this.loadAdminSettings();
    }

    // Navigation setup
    setupNavigation() {
        const navbar = document.querySelector('.navbar');
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navLinks = document.querySelectorAll('.nav-link');

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu close on click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarToggler.getAttribute('aria-expanded') === 'true') {
                    navbarToggler.click();
                }
            });
        });
    }

    // Scroll animations
    setupScrollAnimations() {
        const reveals = document.querySelectorAll('.reveal');
        
        const revealOnScroll = () => {
            reveals.forEach(element => {
                const windowHeight = window.innerHeight;
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;

                if (elementTop < windowHeight - elementVisible) {
                    element.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', revealOnScroll);
        revealOnScroll(); // Initial check
    }

    // Holiday banner logic
    setupHolidayBanner() {
        const banner = document.getElementById('holidayBanner');
        const closeBtn = document.getElementById('closeBanner');
        
        if (!banner) return;

        const shouldShowBanner = this.checkHolidayPeriod();
        const adminSettings = this.getAdminSettings();
        
        if (adminSettings.holidayBanner?.forceShow) {
            banner.style.display = 'block';
            if (adminSettings.holidayBanner.customText) {
                document.getElementById('holidayMessage').textContent = adminSettings.holidayBanner.customText;
            }
        } else if (adminSettings.holidayBanner?.disabled) {
            banner.style.display = 'none';
        } else if (shouldShowBanner) {
            banner.style.display = 'block';
        }

        closeBtn?.addEventListener('click', () => {
            banner.style.display = 'none';
            // Store dismissal in localStorage for 24 hours
            const dismissal = {
                dismissed: true,
                timestamp: Date.now()
            };
            localStorage.setItem('holidayBannerDismissed', JSON.stringify(dismissal));
        });
    }

    checkHolidayPeriod() {
        const now = new Date();
        const year = now.getFullYear();
        
        // Check if banner was dismissed recently
        const dismissal = JSON.parse(localStorage.getItem('holidayBannerDismissed') || '{}');
        if (dismissal.dismissed && (Date.now() - dismissal.timestamp) < 24 * 60 * 60 * 1000) {
            return false;
        }

        // Thanksgiving (4th Thursday of November)
        const thanksgiving = new Date(year, 10, 1);
        while (thanksgiving.getDay() !== 4) {
            thanksgiving.setDate(thanksgiving.getDate() + 1);
        }
        thanksgiving.setDate(thanksgiving.getDate() + 21);

        // Christmas
        const christmas = new Date(year, 11, 25);

        // New Year week (Dec 26 - Jan 1)
        const newYearStart = new Date(year, 11, 26);
        const newYearEnd = new Date(year + 1, 0, 1);

        return (
            (now >= thanksgiving && now <= new Date(thanksgiving.getTime() + 24 * 60 * 60 * 1000)) ||
            (now.getDate() === christmas.getDate() && now.getMonth() === christmas.getMonth()) ||
            (now >= newYearStart && now <= newYearEnd)
        );
    }

    // Testimonials slider
    setupTestimonials() {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;

        const adminSettings = this.getAdminSettings();
        const testimonials = adminSettings.testimonials || [
            "AnitechCS transformed our digital presence completely. Their expertise in web development is unmatched! — Sarah Johnson, TechCorp Inc.",
            "Outstanding cloud hosting services with 99.9% uptime. The support team is always responsive and helpful. — Michael Chen, Global Retail",
            "The ERP integration was seamless and has improved our operational efficiency by 40%. Highly recommended! — David Wilson, Manufacturing Pro"
        ];

        this.renderTestimonials(testimonials);
    }

    renderTestimonials(testimonials) {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;

        slider.innerHTML = testimonials.map(testimonial => {
            const [quote, author] = testimonial.split(' — ');
            return `
                <div class="testimonial-item">
                    <div class="testimonial-text">"${quote}"</div>
                    <div class="testimonial-author">— ${author}</div>
                </div>
            `;
        }).join('');
    }

    // Admin settings management
    getAdminSettings() {
        return JSON.parse(localStorage.getItem('anitechAdminSettings') || '{}');
    }

    saveAdminSettings(settings) {
        localStorage.setItem('anitechAdminSettings', JSON.stringify(settings));
    }

    loadAdminSettings() {
        const settings = this.getAdminSettings();
        
        // Apply holiday banner settings
        if (settings.holidayBanner) {
            const banner = document.getElementById('holidayBanner');
            if (banner && settings.holidayBanner.forceShow) {
                banner.style.display = 'block';
                if (settings.holidayBanner.customText) {
                    const messageEl = document.getElementById('holidayMessage');
                    if (messageEl) messageEl.textContent = settings.holidayBanner.customText;
                }
            }
        }

        // Apply testimonials if on home page
        if (settings.testimonials && document.querySelector('.testimonial-slider')) {
            this.renderTestimonials(settings.testimonials);
        }
    }
}

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnitechWebsite();
});

// Utility function for currency formatting
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
}