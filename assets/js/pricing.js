// assets/js/pricing.js
class PricingManager {
    constructor() {
        this.basePrices = {
            website: {
                basic: 499,
                corporate: 999,
                ecommerce: 1499,
                enterprise: 2999
            },
            hosting: {
                basic: 15,
                business: 49,
                enterprise: 99
            },
            maintenance: {
                monthly: 59,
                annual: 499
            }
        };

        this.exchangeRates = {};
        this.currentCurrency = 'USD';
        this.holidayDiscount = false;
        
        this.init();
    }

    async init() {
        await this.loadExchangeRates();
        this.setupEventListeners();
        this.updatePrices();
    }

    async loadExchangeRates() {
        try {
            // Fallback rates in case API fails
            this.exchangeRates = {
                USD: 1,
                INR: 83.25,
                EUR: 0.92,
                GBP: 0.79,
                CAD: 1.36,
                PHP: 56.23,
                ZAR: 18.75
            };

            // Try to fetch live rates
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (response.ok) {
                const data = await response.json();
                this.exchangeRates = data.rates;
            } else {
                console.warn('Using fallback exchange rates');
            }
        } catch (error) {
            console.warn('Failed to fetch exchange rates, using fallback:', error);
        }

        // Apply admin settings if available
        const adminSettings = JSON.parse(localStorage.getItem('anitechAdminSettings') || '{}');
        if (adminSettings.currencyRates) {
            this.exchangeRates = { ...this.exchangeRates, ...adminSettings.currencyRates };
        }
    }

    setupEventListeners() {
        const currencySelect = document.getElementById('currencySelect');
        const discountToggle = document.getElementById('discountToggle');

        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => {
                this.currentCurrency = e.target.value;
                this.updatePrices();
            });
        }

        if (discountToggle) {
            discountToggle.addEventListener('change', (e) => {
                this.holidayDiscount = e.target.checked;
                this.updatePrices();
            });
        }
    }

    updatePrices() {
        this.updateWebsitePrices();
        this.updateHostingPrices();
        this.updateMaintenancePrices();
    }

    updateWebsitePrices() {
        const elements = {
            basic: document.getElementById('basicPrice'),
            corporate: document.getElementById('corporatePrice'),
            ecommerce: document.getElementById('ecommercePrice'),
            enterprise: document.getElementById('enterprisePrice')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                let price = this.basePrices.website[key];
                price = this.applyDiscount(price);
                price = this.convertCurrency(price);
                elements[key].textContent = this.formatPrice(price, this.currentCurrency);
            }
        });
    }

    updateHostingPrices() {
        const elements = {
            basic: document.getElementById('hostingBasicPrice'),
            business: document.getElementById('hostingBusinessPrice'),
            enterprise: document.getElementById('hostingEnterprisePrice')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                let price = this.basePrices.hosting[key];
                price = this.applyDiscount(price);
                price = this.convertCurrency(price);
                elements[key].textContent = this.formatPrice(price, this.currentCurrency, true);
            }
        });
    }

    updateMaintenancePrices() {
        const elements = {
            monthly: document.getElementById('maintenanceMonthlyPrice'),
            annual: document.getElementById('maintenanceAnnualPrice')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                let price = this.basePrices.maintenance[key];
                price = this.applyDiscount(price);
                price = this.convertCurrency(price);
                const isMonthly = key === 'monthly';
                elements[key].textContent = this.formatPrice(price, this.currentCurrency, isMonthly);
            }
        });
    }

    applyDiscount(price) {
        if (this.holidayDiscount) {
            return price * 0.85; // 15% discount
        }
        return price;
    }

    convertCurrency(price) {
        const rate = this.exchangeRates[this.currentCurrency] || 1;
        return price * rate;
    }

    formatPrice(price, currency, isMonthly = false) {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);

        return isMonthly ? `${formatted}/month` : formatted;
    }

    // Auto-detect currency based on IP (simulated)
    async autoDetectCurrency() {
        try {
            // This is a simplified version - in production, you'd use a proper IP geolocation service
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                const currency = data.currency || 'USD';
                
                // Map to supported currencies
                const supportedCurrencies = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'PHP', 'ZAR'];
                if (supportedCurrencies.includes(currency)) {
                    this.currentCurrency = currency;
                    const select = document.getElementById('currencySelect');
                    if (select) select.value = currency;
                }
            }
        } catch (error) {
            console.warn('Could not auto-detect currency:', error);
        }
    }
}

// Initialize pricing manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.pricing-section')) {
        new PricingManager();
    }
});