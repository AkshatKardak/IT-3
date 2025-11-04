/**
 * AnitechCS Corporate Website - Pricing & Currency Management
 * Handles currency detection, conversion, formatting, and holiday discounts
 */

// Currency configuration
const CURRENCY_CONFIG = {
    base: 'USD',
    supported: {
        'USD': { symbol: '$', name: 'US Dollar', locale: 'en-US' },
        'INR': { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
        'EUR': { symbol: '€', name: 'Euro', locale: 'de-DE' },
        'GBP': { symbol: '£', name: 'British Pound', locale: 'en-GB' },
        'CAD': { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
        'PHP': { symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
        'ZAR': { symbol: 'R', name: 'South African Rand', locale: 'en-ZA' }
    },
    // Fallback rates (updated from admin or API)
    fallbackRates: {
        'USD': 1,
        'INR': 83.12,
        'EUR': 0.85,
        'GBP': 0.73,
        'CAD': 1.25,
        'PHP': 55.50,
        'ZAR': 18.75
    }
};

// Base pricing in USD
const BASE_PRICING = {
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

// Current state
let currentState = {
    currency: 'USD',
    rates: { ...CURRENCY_CONFIG.fallbackRates },
    holidayDiscount: false,
    isAutoDetected: true
};

// Initialize pricing system
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('services') || 
        window.location.pathname.includes('pricing')) {
        initializePricingSystem();
    }
});

/**
 * Initialize the pricing system
 */
async function initializePricingSystem() {
    try {
        // Load admin settings
        loadAdminCurrencySettings();
        
        // Detect user location and currency
        await detectUserCurrency();
        
        // Fetch live exchange rates
        await fetchExchangeRates();
        
        // Setup currency controls
        setupCurrencyControls();
        
        // Render pricing
        renderAllPricing();
        
        // Initialize holiday discount detection
        initializeHolidayDiscount();
        
        console.log('Pricing system initialized successfully');
    } catch (error) {
        console.error('Error initializing pricing system:', error);
        // Fallback to default USD pricing
        renderAllPricing();
    }
}

/**
 * Load admin currency settings from localStorage
 */
function loadAdminCurrencySettings() {
    try {
        const adminSettings = JSON.parse(localStorage.getItem('anitechcs_admin_settings') || '{}');
        
        if (adminSettings.currency) {
            // Update fallback rates if provided
            if (adminSettings.currency.fallbackRates) {
                currentState.rates = { ...currentState.rates, ...adminSettings.currency.fallbackRates };
            }
            
            // Set default currency if provided
            if (adminSettings.currency.defaultCurrency && 
                CURRENCY_CONFIG.supported[adminSettings.currency.defaultCurrency]) {
                currentState.currency = adminSettings.currency.defaultCurrency;
                currentState.isAutoDetected = false;
            }
        }
    } catch (error) {
        console.error('Error loading admin currency settings:', error);
    }
}

/**
 * Detect user currency based on location
 */
async function detectUserCurrency() {
    if (!currentState.isAutoDetected) return;
    
    try {
        // Try to get timezone first (faster)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const currencyFromTimezone = getCurrencyFromTimezone(timezone);
        
        if (currencyFromTimezone) {
            currentState.currency = currencyFromTimezone;
            return;
        }
        
        // Fallback to IP-based detection
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            const data = await response.json();
            const detectedCurrency = getCurrencyFromCountry(data.country_code);
            if (detectedCurrency) {
                currentState.currency = detectedCurrency;
            }
        }
    } catch (error) {
        console.error('Error detecting user currency:', error);
        // Keep default USD
    }
}

/**
 * Get currency from timezone
 */
function getCurrencyFromTimezone(timezone) {
    const timezoneMap = {
        'America/New_York': 'USD',
        'America/Chicago': 'USD',
        'America/Denver': 'USD',
        'America/Los_Angeles': 'USD',
        'America/Toronto': 'CAD',
        'America/Vancouver': 'CAD',
        'Europe/London': 'GBP',
        'Europe/Dublin': 'EUR',
        'Europe/Paris': 'EUR',
        'Europe/Berlin': 'EUR',
        'Europe/Amsterdam': 'EUR',
        'Asia/Kolkata': 'INR',
        'Asia/Mumbai': 'INR',
        'Asia/Manila': 'PHP',
        'Africa/Johannesburg': 'ZAR'
    };
    
    return timezoneMap[timezone] || null;
}

/**
 * Get currency from country code
 */
function getCurrencyFromCountry(countryCode) {
    const countryMap = {
        'US': 'USD',
        'IN': 'INR',
        'GB': 'GBP',
        'CA': 'CAD',
        'PH': 'PHP',
        'ZA': 'ZAR',
        // European countries
        'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
        'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR'
    };
    
    return countryMap[countryCode] || null;
}

/**
 * Fetch live exchange rates
 */
async function fetchExchangeRates() {
    try {
        // Using a free exchange rate API (replace with preferred service)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        
        if (response.ok) {
            const data = await response.json();
            
            // Update rates for supported currencies
            Object.keys(CURRENCY_CONFIG.supported).forEach(currency => {
                if (data.rates[currency]) {
                    currentState.rates[currency] = data.rates[currency];
                }
            });
            
            console.log('Exchange rates updated successfully');
        } else {
            throw new Error('Failed to fetch exchange rates');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        console.log('Using fallback exchange rates');
        // Keep fallback rates
    }
}

/**
 * Setup currency controls UI
 */
function setupCurrencyControls() {
    const controlsContainer = document.querySelector('.currency-controls');
    if (!controlsContainer) return;
    
    const controlsHTML = `
        <div class="control-group">
            <div class="currency-selector-wrapper">
                <label for="currency-select">Currency:</label>
                <select id="currency-select" class="currency-selector">
                    <option value="AUTO" ${currentState.isAutoDetected ? 'selected' : ''}>AUTO (by location)</option>
                    ${Object.entries(CURRENCY_CONFIG.supported).map(([code, info]) => 
                        `<option value="${code}" ${currentState.currency === code && !currentState.isAutoDetected ? 'selected' : ''}>
                            ${code} - ${info.name}
                        </option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="holiday-discount-wrapper">
                <label class="toggle-label">
                    <span>Holiday Discount (15% off):</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="holiday-toggle" ${currentState.holidayDiscount ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </label>
            </div>
        </div>
        
        <div class="pricing-info">
            <p><small>
                <strong>Current Currency:</strong> ${currentState.currency} (${CURRENCY_CONFIG.supported[currentState.currency].name})
                ${currentState.isAutoDetected ? '(Auto-detected)' : '(Manual)'}
                <br>
                <strong>Exchange Rate:</strong> 1 USD = ${formatCurrency(currentState.rates[currentState.currency], currentState.currency, false)} ${currentState.currency}
                <br>
                <em>Prices are converted from USD base rates and may vary with live exchange rates.</em>
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
            currentState.isAutoDetected = true;
            detectUserCurrency().then(() => {
                updatePricingInfo();
                renderAllPricing();
            });
        } else {
            currentState.currency = selected;
            currentState.isAutoDetected = false;
            updatePricingInfo();
            renderAllPricing();
        }
    });
    
    holidayToggle.addEventListener('change', (e) => {
        currentState.holidayDiscount = e.target.checked;
        renderAllPricing();
    });
}

/**
 * Update pricing info display
 */
function updatePricingInfo() {
    const pricingInfo = document.querySelector('.pricing-info');
    if (pricingInfo) {
        pricingInfo.innerHTML = `
            <p><small>
                <strong>Current Currency:</strong> ${currentState.currency} (${CURRENCY_CONFIG.supported[currentState.currency].name})
                ${currentState.isAutoDetected ? '(Auto-detected)' : '(Manual)'}
                <br>
                <strong>Exchange Rate:</strong> 1 USD = ${formatCurrency(currentState.rates[currentState.currency], currentState.currency, false)} ${currentState.currency}
                <br>
                <em>Prices are converted from USD base rates and may vary with live exchange rates.</em>
            </small></p>
        `;
    }
}

/**
 * Initialize holiday discount based on current date
 */
function initializeHolidayDiscount() {
    const today = new Date();
    const isHolidayPeriod = checkHolidayPeriod(today);
    
    // Auto-enable holiday discount during holiday periods
    if (isHolidayPeriod) {
        currentState.holidayDiscount = true;
        const holidayToggle = document.getElementById('holiday-toggle');
        if (holidayToggle) {
            holidayToggle.checked = true;
        }
    }
}

/**
 * Check if current date falls within holiday period
 */
function checkHolidayPeriod(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Thanksgiving (4th Thursday of November)
    const thanksgiving = getThanksgivingDate(year);
    if (date.toDateString() === thanksgiving.toDateString()) {
        return true;
    }
    
    // Christmas (December 25)
    if (month === 11 && day === 25) {
        return true;
    }
    
    // New Year Week (December 26 - January 1)
    if ((month === 11 && day >= 26) || (month === 0 && day === 1)) {
        return true;
    }
    
    return false;
}

/**
 * Get Thanksgiving date (4th Thursday of November)
 */
function getThanksgivingDate(year) {
    const november = new Date(year, 10, 1);
    const firstThursday = 1 + (4 - november.getDay() + 7) % 7;
    return new Date(year, 10, firstThursday + 21);
}

/**
 * Render all pricing sections
 */
function renderAllPricing() {
    renderWebsitePricing();
    renderCloudHostingPricing();
    renderMaintenancePricing();
}

/**
 * Render website development pricing
 */
function renderWebsitePricing() {
    const container = document.querySelector('.website-pricing');
    if (!container) return;
    
    const pricingHTML = Object.entries(BASE_PRICING.websiteDevelopment).map(([key, item]) => {
        const convertedPrice = convertPrice(item.price);
        const finalPrice = applyHolidayDiscount(convertedPrice);
        const isDiscounted = currentState.holidayDiscount && convertedPrice !== finalPrice;
        
        return `
            <div class="pricing-card ${key === 'corporate' ? 'featured' : ''}">
                ${key === 'corporate' ? '<div class="pricing-badge">Popular</div>' : ''}
                <div class="pricing-title">${item.name}</div>
                <div class="pricing-price">
                    ${isDiscounted ? `<span class="original-price">${formatCurrency(convertedPrice)}</span>` : ''}
                    ${formatCurrency(finalPrice)}${item.suffix || ''}
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

/**
 * Render cloud hosting pricing
 */
function renderCloudHostingPricing() {
    const container = document.querySelector('.hosting-pricing');
    if (!container) return;
    
    const pricingHTML = Object.entries(BASE_PRICING.cloudHosting).map(([key, item]) => {
        const convertedPrice = convertPrice(item.price);
        const finalPrice = applyHolidayDiscount(convertedPrice);
        const isDiscounted = currentState.holidayDiscount && convertedPrice !== finalPrice;
        
        return `
            <div class="pricing-card ${key === 'business' ? 'featured' : ''}">
                ${key === 'business' ? '<div class="pricing-badge">Recommended</div>' : ''}
                <div class="pricing-title">${item.name}</div>
                <div class="pricing-price">
                    ${isDiscounted ? `<span class="original-price">${formatCurrency(convertedPrice)}</span>` : ''}
                    ${formatCurrency(finalPrice)}
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

/**
 * Render maintenance pricing
 */
function renderMaintenancePricing() {
    const container = document.querySelector('.maintenance-pricing');
    if (!container) return;
    
    const pricingHTML = Object.entries(BASE_PRICING.maintenance).map(([key, item]) => {
        const convertedPrice = convertPrice(item.price);
        const finalPrice = applyHolidayDiscount(convertedPrice);
        const isDiscounted = currentState.holidayDiscount && convertedPrice !== finalPrice;
        
        return `
            <div class="pricing-card ${key === 'annual' ? 'featured' : ''}">
                ${key === 'annual' ? '<div class="pricing-badge">Best Value</div>' : ''}
                <div class="pricing-title">${item.name}</div>
                <div class="pricing-price">
                    ${isDiscounted ? `<span class="original-price">${formatCurrency(convertedPrice)}</span>` : ''}
                    ${formatCurrency(finalPrice)}
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

/**
 * Convert price from USD to current currency
 */
function convertPrice(usdPrice) {
    if (currentState.currency === 'USD') {
        return usdPrice;
    }
    
    const rate = currentState.rates[currentState.currency] || 1;
    return Math.round(usdPrice * rate * 100) / 100;
}

/**
 * Apply holiday discount to price
 */
function applyHolidayDiscount(price) {
    if (!currentState.holidayDiscount) {
        return price;
    }
    
    const discounted = price * 0.85; // 15% off
    return Math.round(discounted * 100) / 100;
}

/**
 * Format currency with proper locale and symbol
 */
function formatCurrency(amount, currencyCode = null, includeSymbol = true) {
    const currency = currencyCode || currentState.currency;
    const config = CURRENCY_CONFIG.supported[currency];
    
    if (!config) {
        return `$${amount.toFixed(2)}`;
    }
    
    try {
        if (includeSymbol) {
            return new Intl.NumberFormat(config.locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } else {
            return new Intl.NumberFormat(config.locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        }
    } catch (error) {
        console.error('Error formatting currency:', error);
        return `${config.symbol}${amount.toFixed(2)}`;
    }
}

/**
 * Update currency rates (for admin use)
 */
function updateCurrencyRates(newRates) {
    currentState.rates = { ...currentState.rates, ...newRates };
    renderAllPricing();
    updatePricingInfo();
}

/**
 * Get current pricing state (for admin/debugging)
 */
function getCurrentPricingState() {
    return {
        currency: currentState.currency,
        rates: currentState.rates,
        holidayDiscount: currentState.holidayDiscount,
        isAutoDetected: currentState.isAutoDetected
    };
}

// Add styles for original price strikethrough
if (!document.querySelector('#pricing-styles')) {
    const style = document.createElement('style');
    style.id = 'pricing-styles';
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
        @media (max-width: 768px) {
            .control-group {
                flex-direction: column;
                gap: 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for external use
window.PricingSystem = {
    updateCurrencyRates,
    getCurrentPricingState,
    formatCurrency,
    convertPrice,
    applyHolidayDiscount,
    CURRENCY_CONFIG
};