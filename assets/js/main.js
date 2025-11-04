/**
 * AnitechCS Corporate Website - Main JavaScript
 * Handles navigation, animations, testimonials, and admin integration
 */

// Global configuration
const CONFIG = {
    testimonials: [
        {
            quote: "AnitechCS transformed our digital presence with their exceptional web development services. Highly recommended!",
            author: "Sarah Johnson, CEO TechStart Inc"
        },
        {
            quote: "Outstanding cloud hosting solutions with 99.9% uptime. Their support team is incredibly responsive.",
            author: "Michael Chen, CTO CloudTech Solutions"
        },
        {
            quote: "Professional service and innovative approach. They delivered our e-commerce platform ahead of schedule.",
            author: "Emily Rodriguez, Founder ShopSmart"
        }
    ],
    holidayDates: {
        thanksgiving: null, // Calculated dynamically
        christmas: '2025-12-25',
        newYear: { start: '2025-12-26', end: '2026-01-01' }
    }
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Core functionality
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeTestimonials();
    
    // Holiday banner
    initializeHolidayBanner();
    
    // Admin integration
    loadAdminSettings();
    
    // Page-specific initialization
    const currentPage = getCurrentPage();
    initializePageSpecific(currentPage);
    
    console.log('AnitechCS website initialized successfully');
}

/**
 * Get current page identifier
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('about')) return 'about';
    if (path.includes('services')) return 'services';
    if (path.includes('careers')) return 'careers';
    if (path.includes('contact')) return 'contact';
    if (path.includes('admin')) return 'admin';
    return 'home';
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Sticky header on scroll
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', throttle(() => {
        const currentScrollY = window.scrollY;
        const header = document.querySelector('header');
        
        if (currentScrollY > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
        
        // Hide/show header based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    }, 10));
    
    // Mobile menu toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.innerHTML = navMenu.classList.contains('active') 
                ? '&times;' 
                : '&#9776;';
        });
    }
    
    // Active navigation highlighting
    highlightActiveNavigation();
    
    // Smooth scroll for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
            
            // Close mobile menu
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.innerHTML = '&#9776;';
            }
        });
    });
}

/**
 * Highlight active navigation based on current page
 */
function highlightActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = getCurrentPage();
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if ((currentPage === 'home' && (href === 'index.html' || href === '/' || href === '')) ||
            (currentPage !== 'home' && href.includes(currentPage))) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize scroll-based animations and effects
 */
function initializeScrollEffects() {
    const revealElements = document.querySelectorAll('.reveal');
    
    // Create intersection observer for reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }, 10));
    }
}

/**
 * Initialize general animations
 */
function initializeAnimations() {
    // Card hover effects
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Button ripple effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
}

/**
 * Create ripple effect for buttons
 */
function createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleAnimation 0.6s ease-out;
        pointer-events: none;
    `;
    
    // Add ripple animation keyframes if not exists
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes rippleAnimation {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

/**
 * Initialize testimonials slider
 */
function initializeTestimonials() {
    const testimonialsContainer = document.querySelector('.testimonials-slider');
    if (!testimonialsContainer) return;
    
    // Get testimonials from admin settings or use default
    const adminSettings = getAdminSettings();
    const testimonials = adminSettings.testimonials || CONFIG.testimonials;
    
    if (testimonials.length === 0) return;
    
    // Create testimonials HTML
    let currentIndex = 0;
    
    function renderTestimonials() {
        const testimonialsHTML = testimonials.map((testimonial, index) => `
            <div class="testimonial-item ${index === currentIndex ? 'active' : ''}" 
                 style="display: ${index === currentIndex ? 'block' : 'none'}">
                <div class="testimonial-quote">"${testimonial.quote}"</div>
                <div class="testimonial-author">— ${testimonial.author}</div>
            </div>
        `).join('');
        
        testimonialsContainer.innerHTML = `
            ${testimonialsHTML}
            <div class="testimonial-controls">
                <button class="testimonial-prev" aria-label="Previous testimonial">❮</button>
                <div class="testimonial-dots">
                    ${testimonials.map((_, index) => 
                        `<button class="testimonial-dot ${index === currentIndex ? 'active' : ''}" 
                                data-index="${index}" aria-label="Go to testimonial ${index + 1}"></button>`
                    ).join('')}
                </div>
                <button class="testimonial-next" aria-label="Next testimonial">❯</button>
            </div>
        `;
        
        // Add styles for testimonial controls
        if (!document.querySelector('#testimonial-styles')) {
            const style = document.createElement('style');
            style.id = 'testimonial-styles';
            style.textContent = `
                .testimonial-controls {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 2rem;
                    gap: 1rem;
                }
                .testimonial-prev, .testimonial-next {
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: var(--transition-fast);
                }
                .testimonial-prev:hover, .testimonial-next:hover {
                    background: var(--secondary-color);
                    transform: scale(1.1);
                }
                .testimonial-dots {
                    display: flex;
                    gap: 0.5rem;
                }
                .testimonial-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: none;
                    background: var(--border-color);
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                .testimonial-dot.active {
                    background: var(--primary-color);
                }
                .testimonial-item {
                    animation: fadeInUp 0.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add event listeners
        const prevBtn = testimonialsContainer.querySelector('.testimonial-prev');
        const nextBtn = testimonialsContainer.querySelector('.testimonial-next');
        const dots = testimonialsContainer.querySelectorAll('.testimonial-dot');
        
        prevBtn.addEventListener('click', () => showTestimonial(currentIndex - 1));
        nextBtn.addEventListener('click', () => showTestimonial(currentIndex + 1));
        
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                showTestimonial(index);
            });
        });
    }
    
    function showTestimonial(index) {
        if (index < 0) index = testimonials.length - 1;
        if (index >= testimonials.length) index = 0;
        
        currentIndex = index;
        renderTestimonials();
    }
    
    // Initial render
    renderTestimonials();
    
    // Auto-rotate testimonials
    setInterval(() => {
        showTestimonial(currentIndex + 1);
    }, 5000);
}

/**
 * Initialize holiday banner functionality
 */
function initializeHolidayBanner() {
    const adminSettings = getAdminSettings();
    
    // Calculate Thanksgiving date (4th Thursday of November)
    const year = new Date().getFullYear();
    const thanksgiving = getThanksgivingDate(year);
    CONFIG.holidayDates.thanksgiving = thanksgiving.toISOString().split('T')[0];
    
    // Check if holiday banner should be shown
    if (shouldShowHolidayBanner(adminSettings)) {
        createHolidayBanner(adminSettings);
    }
}

/**
 * Calculate Thanksgiving date (4th Thursday of November)
 */
function getThanksgivingDate(year) {
    const november = new Date(year, 10, 1); // November 1st
    const firstThursday = 1 + (4 - november.getDay() + 7) % 7;
    return new Date(year, 10, firstThursday + 21); // 4th Thursday
}

/**
 * Check if holiday banner should be displayed
 */
function shouldShowHolidayBanner(adminSettings) {
    // Check admin override settings
    if (adminSettings.holidayBanner) {
        if (adminSettings.holidayBanner.forceShow) return true;
        if (adminSettings.holidayBanner.disable) return false;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const { thanksgiving, christmas, newYear } = CONFIG.holidayDates;
    
    // Check if today is a holiday
    return today === thanksgiving ||
           today === christmas ||
           (today >= newYear.start && today <= newYear.end);
}

/**
 * Create and display holiday banner
 */
function createHolidayBanner(adminSettings) {
    // Check if banner already exists
    if (document.querySelector('.holiday-banner')) return;
    
    const customText = adminSettings.holidayBanner?.customText;
    const defaultText = "🎉 Holiday Special: 15% off all services during Thanksgiving, Christmas & New Year! Contact us today! 🎁";
    const bannerText = customText || defaultText;
    
    const banner = document.createElement('div');
    banner.className = 'holiday-banner';
    banner.innerHTML = `
        <div class="container">
            <div class="banner-text">${bannerText}</div>
            <button class="close-btn" aria-label="Close banner">&times;</button>
        </div>
    `;
    
    // Insert at the beginning of body
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Adjust body padding for fixed header
    document.body.style.paddingTop = `${banner.offsetHeight}px`;
    
    // Close button functionality
    const closeBtn = banner.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        banner.remove();
        document.body.style.paddingTop = '0';
        
        // Save dismissal to localStorage (expires in 24 hours)
        const dismissalData = {
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };
        localStorage.setItem('holidayBannerDismissed', JSON.stringify(dismissalData));
    });
    
    // Check if banner was already dismissed today
    const dismissalData = localStorage.getItem('holidayBannerDismissed');
    if (dismissalData) {
        const parsed = JSON.parse(dismissalData);
        const today = new Date().toISOString().split('T')[0];
        const dismissedToday = parsed.date === today;
        
        if (dismissedToday && !adminSettings.holidayBanner?.forceShow) {
            banner.remove();
            document.body.style.paddingTop = '0';
        }
    }
}

/**
 * Load and apply admin settings
 */
function loadAdminSettings() {
    const settings = getAdminSettings();
    
    // Apply custom testimonials if available
    if (settings.testimonials && settings.testimonials.length > 0) {
        CONFIG.testimonials = settings.testimonials;
    }
}

/**
 * Get admin settings from localStorage
 */
function getAdminSettings() {
    try {
        const settings = localStorage.getItem('anitechcs_admin_settings');
        return settings ? JSON.parse(settings) : {};
    } catch (error) {
        console.error('Error loading admin settings:', error);
        return {};
    }
}

/**
 * Initialize page-specific functionality
 */
function initializePageSpecific(page) {
    switch (page) {
        case 'home':
            initializeHomePage();
            break;
        case 'about':
            initializeAboutPage();
            break;
        case 'services':
            initializeServicesPage();
            break;
        case 'contact':
            initializeContactPage();
            break;
        case 'careers':
            initializeCareersPage();
            break;
        case 'admin':
            // Admin functionality is handled in separate script
            break;
    }
}

/**
 * Initialize home page specific features
 */
function initializeHomePage() {
    // Hero animation sequence
    const heroElements = document.querySelectorAll('.hero h1, .hero p, .hero-buttons');
    heroElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Global presence badges animation
    const officeBadges = document.querySelectorAll('.office-badge');
    officeBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.1}s`;
        badge.classList.add('reveal');
    });
}

/**
 * Initialize about page specific features
 */
function initializeAboutPage() {
    // Leadership cards animation
    const leaderCards = document.querySelectorAll('.leader-card');
    leaderCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('reveal');
    });
}

/**
 * Initialize services page specific features
 */
function initializeServicesPage() {
    // Services cards animation
    const serviceCards = document.querySelectorAll('.services-grid .card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('reveal');
    });
    
    // Pricing cards animation
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('reveal');
    });
}

/**
 * Initialize contact page specific features
 */
function initializeContactPage() {
    // Contact form enhancements
    const form = document.querySelector('.contact-form form');
    if (form) {
        // Add form validation
        form.addEventListener('submit', handleContactFormSubmit);
        
        // Add input animations
        const inputs = form.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }
    
    // Lazy load Google Maps
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadGoogleMap(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(mapContainer);
    }
}

/**
 * Handle contact form submission
 */
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Generate reCAPTCHA token (placeholder)
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.ready(function() {
            grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', {action: 'submit'}).then(function(token) {
                data.recaptchaToken = token;
                submitContactForm(data);
            });
        });
    } else {
        // Fallback to mailto if no backend
        submitContactFormFallback(data);
    }
}

/**
 * Submit contact form with reCAPTCHA token
 */
function submitContactForm(data) {
    // This would typically send to a backend API
    console.log('Contact form data:', data);
    showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
    
    // Reset form
    document.querySelector('.contact-form form').reset();
}

/**
 * Fallback contact form submission using mailto
 */
function submitContactFormFallback(data) {
    const subject = encodeURIComponent(`Contact Form: ${data.service || 'General Inquiry'}`);
    const body = encodeURIComponent(
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        `Phone: ${data.phone || 'Not provided'}\n` +
        `Service: ${data.service || 'General'}\n\n` +
        `Message: ${data.message}`
    );
    
    window.location.href = `mailto:sales@anitechcs.com?subject=${subject}&body=${body}`;
    showNotification('Opening your email client...', 'info');
}

/**
 * Load Google Maps iframe
 */
function loadGoogleMap(container) {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509374!2d-122.4037618846828!3d37.791233579755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580f5c8c5b7b7%3A0x1f8b1b1b1b1b1b1b!2s555%20Mission%20St%2C%20San%20Francisco%2C%20CA%2094105!5e0!3m2!1sen!2sus!4v1699000000000!5m2!1sen!2sus';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.loading = 'lazy';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('aria-hidden', 'false');
    iframe.setAttribute('tabindex', '0');
    
    container.appendChild(iframe);
}

/**
 * Initialize careers page specific features
 */
function initializeCareersPage() {
    // Job cards animation
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('reveal');
    });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                padding: 1rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-medium);
                animation: slideInRight 0.3s ease-out;
            }
            .notification-success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }
            .notification-error { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
            .notification-info { background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8; }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: inherit;
                margin-left: 1rem;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Throttle function for performance optimization
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Export functions for use in other scripts
window.AnitechCS = {
    getAdminSettings,
    showNotification,
    initializeTestimonials,
    CONFIG
};