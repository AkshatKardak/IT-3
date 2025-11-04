/**
 * Enhanced AnitechCS Pricing System with Static Exchange Rates
 * No API keys required - fully self-contained with fallback rates
 * Includes holiday detection, currency auto-detection, and admin panel integration
 */

// Enhanced Static Exchange Rates System - No API Key Required
class StaticExchangeRates {
    constructor() {
        this.baseCurrency = 'USD';
        this.lastUpdated = '2025-11-04'; // Update this when you refresh rates
        
        // Static exchange rates (update these periodically)
        this.staticRates = {
            USD: 1.0000,    // US Dollar (base)
            INR: 83.2500,   // Indian Rupee
            EUR: 0.9200,    // Euro
            GBP: 0.7900,    // British Pound
            CAD: 1.3600,    // Canadian Dollar
            PHP: 56.2300,   // Philippine Peso
            ZAR: 18.7500,   // South African Rand
            AUD: 1.5200,    // Australian Dollar
            JPY: 149.5000,  // Japanese Yen
            CNY: 7.2400     // Chinese Yuan
        };
        
        this.currentRates = { ...this.staticRates };
        this.loadAdminOverrides();
    }
    
    // Load admin panel overrides
    loadAdminOverrides() {
        try {
            const adminSettings = JSON.parse(localStorage.getItem('anitechcs_admin_settings') || '{}');
            if (adminSettings.currency && adminSettings.currency.fallbackRates) {
                this.currentRates = { ...this.staticRates, ...adminSettings.currency.fallbackRates };
            }
        } catch (error) {
            console.warn('Failed to load admin currency overrides:', error);
        }
    }
    
    // Get exchange rate for a currency
    getRate(currency) {
        return this.currentRates[currency.toUpperCase()] || 1;
    }
    
    // Convert amount from base currency to target currency
    convert(amount, targetCurrency) {
        const rate = this.getRate(targetCurrency);
        return amount * rate;
    }
    
    // Convert between any two currencies
    convertBetween(amount, fromCurrency, toCurrency) {
        const fromRate = this.getRate(fromCurrency);
        const toRate = this.getRate(toCurrency);
        
        // Convert to base currency first, then to target
        const baseAmount = amount / fromRate;
        return baseAmount * toRate;
    }
    
    // Get all available currencies
    getAvailableCurrencies() {
        return Object.keys(this.currentRates);
    }
    
    // Get currency info
    getCurrencyInfo(currency) {
        const info = {
            USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸', locale: 'en-US' },
            INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', locale: 'en-IN' },
            EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺', locale: 'de-DE' },
            GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧', locale: 'en-GB' },
            CAD: { name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', locale: 'en-CA' },
            PHP: { name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', locale: 'en-PH' },
            ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦', locale: 'en-ZA' },
            AUD: { name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', locale: 'en-AU' },
            JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', locale: 'ja-JP' },
            CNY: { name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', locale: 'zh-CN' }
        };
        
        return info[currency.toUpperCase()] || { name: currency, symbol: '', flag: '', locale: 'en-US' };
    }
    
    // Format currency amount
    formatCurrency(amount, currency) {
        const currencyInfo = this.getCurrencyInfo(currency);
        
        try {
            return new Intl.NumberFormat(currencyInfo.locale, {
                style: 'currency',
                currency: currency.toUpperCase(),
                minimumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2,
                maximumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2
            }).format(amount);
        } catch (error) {
            // Fallback formatting if Intl.NumberFormat fails
            const formattedAmount = amount.toLocaleString('en-US', {
                minimumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2,
                maximumFractionDigits: currency.toUpperCase() === 'JPY' ? 0 : 2
            });
            return `${currencyInfo.symbol}${formattedAmount}`;
        }
    }
    
    // Get rate age (how old are the rates)
    getRateAge() {
        const lastUpdate = new Date(this.lastUpdated);
        const now = new Date();
        const daysDiff = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
        
        return {
            days: daysDiff,
            lastUpdated: this.lastUpdated,
            status: daysDiff < 7 ? 'fresh' : daysDiff < 30 ? 'good' : 'stale'
        };
    }
    
    // Update static rates manually (call this when you want to refresh)
    updateStaticRates(newRates, updateDate = null) {
        this.staticRates = { ...this.staticRates, ...newRates };
        this.currentRates = { ...this.staticRates };
        this.lastUpdated = updateDate || new Date().toISOString().split('T')[0];
        this.loadAdminOverrides(); // Reapply admin overrides
        
        console.log('📊 Static exchange rates updated:', this.lastUpdated);
    }
    
    // Attempt to fetch live rates (with fallback to static rates)
    async fetchLiveRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            if (data.rates) {
                const updatedRates = {};
                Object.keys(this.staticRates).forEach(currency => {
                    if (data.rates[currency]) {
                        updatedRates[currency] = data.rates[currency];
                    }
                });
                
                this.updateStaticRates(updatedRates, new Date().toISOString().split('T')[0]);
                return true;
            }
        } catch (error) {
            console.warn('Failed to fetch live rates, using static rates:', error);
        }
        return false;
    }
}

// Holiday Detection and Discount System
class HolidaySystem {
    constructor() {
        this.holidays = this.calculateHolidays();
        this.discountRate = 0.15; // 15% discount
    }
    
    calculateHolidays() {
        const currentYear = new Date().getFullYear();
        return {
            thanksgiving: this.getThanksgivingDate(currentYear),
            christmas: new Date(currentYear, 11, 25), // December 25
            newYear: new Date(currentYear + 1, 0, 1), // January 1
            newYearWeekStart: new Date(currentYear, 11, 26), // December 26
            newYearWeekEnd: new Date(currentYear + 1, 0, 1) // January 1
        };
    }
    
    getThanksgivingDate(year) {
        // 4th Thursday of November
        const november = new Date(year, 10, 1);
        const firstThursday = 1 + (4 - november.getDay() + 7) % 7;
        return new Date(year, 10, firstThursday + 21);
    }
    
    isHolidayPeriod() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Check admin override
        try {
            const adminSettings = JSON.parse(localStorage.getItem('anitechcs_admin_settings') || '{}');
            if (adminSettings.holidayBanner) {
                if (adminSettings.holidayBanner.disable) return false;
                if (adminSettings.holidayBanner.forceShow) return true;
                if (!adminSettings.holidayBanner.autoEnable) return false;
            }
        } catch (error) {
            console.warn('Failed to load admin holiday settings:', error);
        }
        
        // Thanksgiving (US - 4th Thursday of November)
        const thanksgiving = this.holidays.thanksgiving;
        if (today.getTime() === thanksgiving.getTime()) {
            return true;
        }
        
        // Christmas Day
        if (today.getTime() === this.holidays.christmas.getTime()) {
            return true;
        }
        
        // New Year Week (Dec 26 - Jan 1)
        if (today >= this.holidays.newYearWeekStart && today <= this.holidays.newYearWeekEnd) {
            return true;
        }
        
        return false;
    }
    
    getDiscountRate() {
        return this.isHolidayPeriod() ? this.discountRate : 0;
    }
    
    applyDiscount(price) {
        const discount = this.getDiscountRate();
        return price * (1 - discount);
    }
}

// Main Pricing Manager
class PricingManager {
    constructor() {
        this.exchangeRates = new StaticExchangeRates();
        this.holidaySystem = new HolidaySystem();
        this.currentCurrency = this.detectUserCurrency();
        this.isDiscountEnabled = true;
        this.isAutoDetected = true;
        
        // Base pricing in USD
        this.basePricing = {
            websiteDevelopment: {
                basic: { price: 499, name: 'Basic Website', description: '5 pages' },
                corporate: { price: 999, name: 'Corporate Website', description: 'Full-featured business site' },
                ecommerce: { price: 1499, name: 'E-commerce Website', description: 'Online store with payment integration' },
                enterprise: { price: 2999, name: 'Enterprise Custom Solution', description: 'Custom enterprise-grade solution', suffix: '+' }
            },
            cloudHosting: {
                basic: { price: 15, name: 'Basic Hosting', description: '5 GB space', period: 'month' },
                business: { price: 49, name: 'Business Cloud', description: '50 GB space', period: 'month' },
                enterprise: { price: 99, name: 'Enterprise Cloud', description: 'Unlimited space', period: 'month' }
            },
            maintenance: {
                monthly: { price: 59, name: 'Monthly Maintenance', description: 'Website updates & security', period: 'month' },
                annual: { price: 499, name: 'Annual Maintenance', description: 'Full year coverage + discounts', period: 'year' }
            }
        };
        
        this.init();
    }
    
    detectUserCurrency() {
        // Check admin override first
        try {
            const adminSettings = JSON.parse(localStorage.getItem('anitechcs_admin_settings') || '{}');
            if (adminSettings.currency && adminSettings.currency.defaultCurrency) {
                this.isAutoDetected = false;
                return adminSettings.currency.defaultCurrency;
            }
        } catch (error) {
            console.warn('Failed to load admin currency setting:', error);
        }
        
        // Auto-detect based on timezone/locale
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const locale = navigator.language || 'en-US';
            
            // Simple timezone to currency mapping
            const timezoneMap = {
                'America/New_York': 'USD',
                'America/Chicago': 'USD',
                'America/Denver': 'USD',
                'America/Los_Angeles': 'USD',
                'America/Toronto': 'CAD',
                'America/Montreal': 'CAD',
                'America/Vancouver': 'CAD',
                'Europe/London': 'GBP',
                'Europe/Dublin': 'EUR',
                'Europe/Paris': 'EUR',
                'Europe/Berlin': 'EUR',
                'Europe/Rome': 'EUR',
                'Europe/Amsterdam': 'EUR',
                'Asia/Kolkata': 'INR',
                'Asia/Mumbai': 'INR',
                'Asia/Manila': 'PHP',
                'Asia/Tokyo': 'JPY',
                'Asia/Shanghai': 'CNY',
                'Australia/Sydney': 'AUD',
                'Australia/Melbourne': 'AUD',
                'Africa/Johannesburg': 'ZAR'
            };
            
            if (timezoneMap[timezone]) {
                return timezoneMap[timezone];
            }
            
            // Fallback based on locale
            if (locale.includes('en-IN')) return 'INR';
            if (locale.includes('en-GB')) return 'GBP';
            if (locale.includes('en-CA')) return 'CAD';
            if (locale.includes('en-AU')) return 'AUD';
            if (locale.includes('en-ZA')) return 'ZAR';
            if (locale.includes('fil') || locale.includes('tl')) return 'PHP';
            if (locale.includes('ja')) return 'JPY';
            if (locale.includes('zh')) return 'CNY';
            if (/^(de|fr|es|it|nl|pt)/.test(locale)) return 'EUR';
            
        } catch (error) {
            console.warn('Currency detection failed, using USD:', error);
        }
        
        return 'USD'; // Default fallback
    }
    
    init() {
        this.setupCurrencyControls();
        this.updatePrices();
        this.showHolidayBanner();
        this.initializeHolidayDiscount();
        
        // Try to fetch live rates on initialization
        this.exchangeRates.fetchLiveRates().then(success => {
            if (success) {
                this.updatePrices();
                console.log('✅ Live exchange rates fetched successfully');
            }
        });
    }
    
    initializeHolidayDiscount() {
        // Auto-enable holiday discount during holiday periods
        if (this.holidaySystem.isHolidayPeriod()) {
            this.isDiscountEnabled = true;
            const holidayToggle = document.getElementById('holiday-toggle');
            if (holidayToggle) {
                holidayToggle.checked = true;
            }
        }
    }
    
    setupCurrencyControls() {
        const controlsContainer = document.querySelector('.currency-controls');
        if (!controlsContainer) return;
        
        const currencies = this.exchangeRates.getAvailableCurrencies();
        
        const controlsHTML = `
            <div class="control-group">
                <div class="currency-selector-wrapper">
                    <label for="currency-select">Currency:</label>
                    <select id="currency-select" class="currency-selector">
                        <option value="AUTO" ${this.isAutoDetected ? 'selected' : ''}>AUTO (by location)</option>
                        ${currencies.map(currency => {
                            const info = this.exchangeRates.getCurrencyInfo(currency);
                            return `<option value="${currency}" ${this.currentCurrency === currency && !this.isAutoDetected ? 'selected' : ''}>
                                ${currency} - ${info.name}
                            </option>`;
                        }).join('')}
                    </select>
                </div>
                
                <div class="holiday-discount-wrapper">
                    <label class="toggle-label">
                        <span>Holiday Discount (15% off):</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="holiday-toggle" ${this.isDiscountEnabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </label>
                </div>
            </div>
            
            <div class="pricing-info">
                <p><small>
                    <strong>Current Currency:</strong> <span id="current-currency-display"></span>
                    <br>
                    <strong>Exchange Rate:</strong> <span id="exchange-rate-display"></span>
                    <br>
                    <em>Prices are converted from USD base rates using ${this.exchangeRates.getRateAge().status} exchange rates.</em>
                </small></p>
            </div>
        `;
        
        controlsContainer.innerHTML = controlsHTML;
        
        // Add event listeners
        const currencySelect = document.getElementById('currency-select');
        const holidayToggle = document.getElementById('holiday-toggle');
        
        currencySelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            
            if (selected === 'AUTO') {
                this.isAutoDetected = true;
                this.currentCurrency = this.detectUserCurrency();
            } else {
                this.currentCurrency = selected;
                this.isAutoDetected = false;
            }
            
            this.updatePrices();
            
            // Track currency change
            if (typeof sa_event === 'function') {
                sa_event('currency_changed', {
                    new_currency: this.currentCurrency,
                    is_auto_detected: this.isAutoDetected,
                    page: window.location.pathname
                });
            }
        });
        
        holidayToggle.addEventListener('change', (e) => {
            this.isDiscountEnabled = e.target.checked;
            this.updatePrices();
            
            // Track discount toggle
            if (typeof sa_event === 'function') {
                sa_event('discount_toggled', {
                    enabled: this.isDiscountEnabled,
                    page: window.location.pathname
                });
            }
        });
        
        // Update displays
        this.updateCurrencyDisplay();
    }
    
    updateCurrencyDisplay() {
        const info = this.exchangeRates.getCurrencyInfo(this.currentCurrency);
        const rate = this.exchangeRates.getRate(this.currentCurrency);
        
        const currencyDisplay = document.getElementById('current-currency-display');
        const rateDisplay = document.getElementById('exchange-rate-display');
        
        if (currencyDisplay) {
            currencyDisplay.textContent = `${info.flag} ${this.currentCurrency} (${info.name}) ${this.isAutoDetected ? '(Auto-detected)' : '(Manual)'}`;
        }
        
        if (rateDisplay) {
            rateDisplay.textContent = `1 USD = ${this.exchangeRates.formatCurrency(rate, this.currentCurrency, false)} ${this.currentCurrency}`;
        }
    }
    
    updatePrices() {
        this.renderAllPricing();
        this.updateCurrencyDisplay();
        this.updateDiscountIndicator();
    }
    
    renderAllPricing() {
        this.renderWebsitePricing();
        this.renderCloudHostingPricing();
        this.renderMaintenancePricing();
    }
    
    renderWebsitePricing() {
        const container = document.querySelector('.website-pricing');
        if (!container) return;
        
        const pricingHTML = Object.entries(this.basePricing.websiteDevelopment).map(([key, item]) => {
            const convertedPrice = this.convertPrice(item.price);
            const finalPrice = this.applyDiscount(convertedPrice);
            const isDiscounted = this.isDiscountEnabled && this.holidaySystem.isHolidayPeriod() && convertedPrice !== finalPrice;
            
            return `
                <div class="pricing-card ${key === 'corporate' ? 'featured' : ''}">
                    ${key === 'corporate' ? '<div class="pricing-badge">Popular</div>' : ''}
                    <div class="pricing-title">${item.name}</div>
                    <div class="pricing-price">
                        ${isDiscounted ? `<span class="original-price">${this.formatPrice(convertedPrice)}</span>` : ''}
                        ${this.formatPrice(finalPrice)}${item.suffix || ''}
                    </div>
                    <div class="pricing-period">${item.description}</div>
                    <ul class="pricing-features">
                        <li>Responsive Design</li>
                        <li>SEO Optimized</li>
                        <li>Mobile Friendly</li>
                        <li>${key === 'basic' ? '30 Days Support' : '90 Days Support'}</li>
                        ${key !== 'basic' ? '<li>Content Management System</li>' : ''}
                        ${key === 'enterprise' ? '<li>Custom Development</li>' : ''}
                        ${key === 'enterprise' ? '<li>Priority Support</li>' : ''}
                    </ul>
                    <a href="contact.html" class="btn btn-primary">Get Started</a>
                </div>
            `;
        }).join('');
        
        container.innerHTML = pricingHTML;
    }
    
    renderCloudHostingPricing() {
        const container = document.querySelector('.hosting-pricing');
        if (!container) return;
        
        const pricingHTML = Object.entries(this.basePricing.cloudHosting).map(([key, item]) => {
            const convertedPrice = this.convertPrice(item.price);
            const finalPrice = this.applyDiscount(convertedPrice);
            const isDiscounted = this.isDiscountEnabled && this.holidaySystem.isHolidayPeriod() && convertedPrice !== finalPrice;
            
            return `
                <div class="pricing-card ${key === 'business' ? 'featured' : ''}">
                    ${key === 'business' ? '<div class="pricing-badge">Recommended</div>' : ''}
                    <div class="pricing-title">${item.name}</div>
                    <div class="pricing-price">
                        ${isDiscounted ? `<span class="original-price">${this.formatPrice(convertedPrice)}</span>` : ''}
                        ${this.formatPrice(finalPrice)}
                    </div>
                    <div class="pricing-period">per ${item.period}</div>
                    <ul class="pricing-features">
                        <li>${item.description}</li>
                        <li>99.9% Uptime Guarantee</li>
                        <li>SSL Certificate</li>
                        <li>Email Accounts</li>
                        ${key !== 'basic' ? '<li>Daily Backups</li>' : ''}
                        ${key === 'enterprise' ? '<li>Priority Support</li>' : ''}
                        ${key === 'enterprise' ? '<li>Load Balancing</li>' : ''}
                    </ul>
                    <div class="special-offer">
                        ${key !== 'basic' ? '<small>2 months free on annual plan!</small>' : ''}
                    </div>
                    <a href="contact.html" class="btn btn-primary">Choose Plan</a>
                </div>
            `;
        }).join('');
        
        container.innerHTML = pricingHTML;
    }
    
    renderMaintenancePricing() {
        const container = document.querySelector('.maintenance-pricing');
        if (!container) return;
        
        const pricingHTML = Object.entries(this.basePricing.maintenance).map(([key, item]) => {
            const convertedPrice = this.convertPrice(item.price);
            const finalPrice = this.applyDiscount(convertedPrice);
            const isDiscounted = this.isDiscountEnabled && this.holidaySystem.isHolidayPeriod() && convertedPrice !== finalPrice;
            
            return `
                <div class="pricing-card ${key === 'annual' ? 'featured' : ''}">
                    ${key === 'annual' ? '<div class="pricing-badge">Best Value</div>' : ''}
                    <div class="pricing-title">${item.name}</div>
                    <div class="pricing-price">
                        ${isDiscounted ? `<span class="original-price">${this.formatPrice(convertedPrice)}</span>` : ''}
                        ${this.formatPrice(finalPrice)}
                    </div>
                    <div class="pricing-period">per ${item.period}</div>
                    <ul class="pricing-features">
                        <li>Security Updates</li>
                        <li>Content Updates</li>
                        <li>Performance Optimization</li>
                        <li>Technical Support</li>
                        ${key === 'annual' ? '<li>Priority Response</li>' : ''}
                        ${key === 'annual' ? '<li>Free Minor Updates</li>' : ''}
                    </ul>
                    <a href="contact.html" class="btn btn-primary">Get Support</a>
                </div>
            `;
        }).join('');
        
        container.innerHTML = pricingHTML;
    }
    
    convertPrice(usdPrice) {
        if (this.currentCurrency === 'USD') {
            return usdPrice;
        }
        
        const convertedPrice = this.exchangeRates.convert(usdPrice, this.currentCurrency);
        return Math.round(convertedPrice * 100) / 100;
    }
    
    applyDiscount(price) {
        if (!this.isDiscountEnabled || !this.holidaySystem.isHolidayPeriod()) {
            return price;
        }
        
        return this.holidaySystem.applyDiscount(price);
    }
    
    formatPrice(price) {
        return this.exchangeRates.formatCurrency(price, this.currentCurrency);
    }
    
    updateDiscountIndicator() {
        const indicator = document.getElementById('discount-indicator');
        if (!indicator) return;
        
        const isHolidayPeriod = this.holidaySystem.isHolidayPeriod();
        const discountActive = this.isDiscountEnabled && isHolidayPeriod;
        
        if (discountActive) {
            const discountPercent = Math.round(this.holidaySystem.getDiscountRate() * 100);
            indicator.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-gift"></i>
                    <strong>Holiday Special:</strong> ${discountPercent}% off all services!
                </div>
            `;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }
    
    showHolidayBanner() {
        // This will be handled by the main.js holiday banner system
        // Just trigger an event to notify other systems
        if (this.holidaySystem.isHolidayPeriod()) {
            document.dispatchEvent(new CustomEvent('holidayPeriodDetected', {
                detail: {
                    discountRate: this.holidaySystem.getDiscountRate(),
                    isActive: this.isDiscountEnabled
                }
            }));
        }
    }
    
    // Public methods for external use
    setCurrency(currency) {
        if (this.exchangeRates.getAvailableCurrencies().includes(currency.toUpperCase())) {
            this.currentCurrency = currency.toUpperCase();
            this.isAutoDetected = false;
            this.updatePrices();
            
            // Update selector
            const selector = document.getElementById('currency-select');
            if (selector) {
                selector.value = this.currentCurrency;
            }
        }
    }
    
    toggleDiscount(enabled) {
        this.isDiscountEnabled = enabled;
        this.updatePrices();
        
        // Update toggle
        const toggle = document.getElementById('holiday-toggle');
        if (toggle) {
            toggle.checked = this.isDiscountEnabled;
        }
    }
    
    getCurrentCurrency() {
        return this.currentCurrency;
    }
    
    getDiscountStatus() {
        return {
            isHolidayPeriod: this.holidaySystem.isHolidayPeriod(),
            isEnabled: this.isDiscountEnabled,
            discountRate: this.holidaySystem.getDiscountRate()
        };
    }
    
    getCurrentPricingState() {
        return {
            currency: this.currentCurrency,
            rates: this.exchangeRates.currentRates,
            holidayDiscount: this.isDiscountEnabled,
            isAutoDetected: this.isAutoDetected,
            rateAge: this.exchangeRates.getRateAge()
        };
    }
}

// Initialize pricing system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('services') || 
        window.location.pathname.includes('pricing') ||
        document.querySelector('.currency-controls')) {
        try {
            window.pricingManager = new PricingManager();
            console.log('✅ Enhanced pricing system initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize pricing system:', error);
        }
    }
});

// Add enhanced styles for pricing components
if (!document.querySelector('#enhanced-pricing-styles')) {
    const style = document.createElement('style');
    style.id = 'enhanced-pricing-styles';
    style.textContent = `
        .original-price {
            text-decoration: line-through;
            color: #999;
            font-size: 0.8em;
            display: block;
            margin-bottom: 0.25rem;
        }
        
        .special-offer {
            color: #28a745;
            font-weight: 600;
            margin: 1rem 0;
            padding: 0.5rem;
            background: rgba(40, 167, 69, 0.1);
            border-radius: 4px;
            text-align: center;
        }
        
        .currency-selector-wrapper,
        .holiday-discount-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }
        
        .toggle-label {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-weight: 500;
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }
        
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
            background-color: var(--primary-color);
        }
        
        input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }
        
        .control-group {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 3rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        
        .pricing-info {
            text-align: center;
            margin: 1rem 0;
            padding: 1rem;
            background: rgba(0, 123, 255, 0.05);
            border-radius: var(--border-radius);
            border-left: 4px solid var(--primary-color);
        }
        
        @media (max-width: 768px) {
            .control-group {
                flex-direction: column;
                gap: 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for external use and admin panel integration
window.PricingSystem = {
    StaticExchangeRates,
    HolidaySystem,
    PricingManager,
    // Legacy compatibility
    updateCurrencyRates: function(newRates) {
        if (window.pricingManager) {
            window.pricingManager.exchangeRates.updateStaticRates(newRates);
            window.pricingManager.updatePrices();
        }
    },
    getCurrentPricingState: function() {
        return window.pricingManager ? window.pricingManager.getCurrentPricingState() : null;
    }
};