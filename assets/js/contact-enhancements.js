/**
 * Contact Page Enhancements
 * Includes: Math Captcha, Interactive Map, Custom Chat Widget, Form Handling
 * No API keys required - fully self-contained
 */

// Math Captcha Implementation - No API Key Required
class MathCaptcha {
    constructor() {
        this.questionElement = document.getElementById('captchaQuestion');
        this.answerInput = document.getElementById('captcha');
        this.hiddenAnswer = document.getElementById('captchaAnswer');
        this.errorElement = document.getElementById('captchaError');
        
        if (this.questionElement && this.answerInput && this.hiddenAnswer) {
            this.generateQuestion();
            this.setupValidation();
        }
    }
    
    generateQuestion() {
        const operations = ['+', '-', '×'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 20) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 20) + 10; // Ensure positive result
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '×':
                num1 = Math.floor(Math.random() * 10) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                answer = num1 * num2;
                break;
        }
        
        this.questionElement.textContent = `${num1} ${operation} ${num2}`;
        this.hiddenAnswer.value = answer;
        this.answerInput.value = '';
        this.hideError();
    }
    
    setupValidation() {
        this.answerInput.addEventListener('input', () => {
            this.hideError();
        });
        
        this.answerInput.addEventListener('blur', () => {
            this.validateAnswer();
        });
    }
    
    validateAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        const correctAnswer = parseInt(this.hiddenAnswer.value);
        
        if (userAnswer === correctAnswer) {
            this.showSuccess();
            return true;
        } else if (this.answerInput.value !== '') {
            this.showError();
            return false;
        }
        return false;
    }
    
    showError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'block';
            this.answerInput.style.borderColor = '#dc3545';
            this.generateQuestion(); // Generate new question
        }
    }
    
    hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
            this.answerInput.style.borderColor = '';
        }
    }
    
    showSuccess() {
        this.answerInput.style.borderColor = '#28a745';
    }
    
    isValid() {
        return this.validateAnswer();
    }
    
    reset() {
        this.generateQuestion();
    }
}

// Interactive Map with Leaflet.js
function initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    try {
        // Initialize the map
        const map = L.map('map').setView([37.7902, -122.3960], 15);
        
        // Add OpenStreetMap tile layer (NO API KEY NEEDED)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add marker for office
        L.marker([37.7902, -122.3960])
            .addTo(map)
            .bindPopup(`
                <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <strong style="color: #007bff; font-size: 1.1em;">AnitechCS Office</strong><br>
                    <div style="margin: 8px 0; line-height: 1.4;">
                        📍 555 Mission Street<br>
                        San Francisco, CA 94105<br>
                        United States
                    </div>
                    <div style="margin-top: 10px;">
                        <a href="tel:+1-555-123-4567" style="color: #007bff; text-decoration: none; font-weight: 500;">
                            📞 +1 (555) 123-4567
                        </a>
                    </div>
                    <div style="margin-top: 8px; font-size: 0.9em; color: #6c757d;">
                        <strong>Business Hours:</strong><br>
                        Mon-Fri: 9 AM - 6 PM PST
                    </div>
                </div>
            `)
            .openPopup();
        
        // Add scale control
        L.control.scale({
            imperial: true, 
            metric: true
        }).addTo(map);
        
        // Add office area highlight
        const circle = L.circle([37.7902, -122.3960], {
            color: '#007bff',
            fillColor: 'rgba(0, 123, 255, 0.2)',
            fillOpacity: 0.3,
            radius: 200
        }).addTo(map);
        
        // Track map interaction
        map.on('click', function() {
            if (typeof sa_event === 'function') {
                sa_event('map_clicked', {
                    page: 'contact',
                    location: 'office_map'
                });
            }
        });
        
        console.log('📍 Interactive map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        // Fallback: show static map message
        mapElement.innerHTML = `
            <div style="background: #f8f9fa; display: flex; align-items: center; justify-content: center; height: 400px; color: #6c757d; border-radius: 10px;">
                <div style="text-align: center;">
                    <i class="fas fa-map-marker-alt" style="font-size: 3rem; margin-bottom: 1rem; color: #007bff;"></i>
                    <h4>AnitechCS Office</h4>
                    <p>555 Mission Street<br>San Francisco, CA 94105</p>
                    <a href="https://maps.google.com/maps?q=555+Mission+Street,+San+Francisco,+CA+94105" target="_blank" class="btn btn-primary btn-sm">
                        <i class="fas fa-external-link-alt"></i> View on Google Maps
                    </a>
                </div>
            </div>
        `;
    }
}

// FAQ Accordion functionality
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.className = 'fas fa-plus';
            } else {
                // Close all other answers
                faqQuestions.forEach(q => {
                    const a = q.nextElementSibling;
                    const i = q.querySelector('i');
                    if (a) a.style.display = 'none';
                    if (i) i.className = 'fas fa-plus';
                });
                
                answer.style.display = 'block';
                icon.className = 'fas fa-minus';
                
                // Track FAQ interaction
                if (typeof sa_event === 'function') {
                    sa_event('faq_opened', {
                        question: this.textContent.substring(2),
                        page: 'contact'
                    });
                }
            }
        });
    });
}

// Enhanced Contact Form handling
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate captcha
        if (window.mathCaptcha && !window.mathCaptcha.isValid()) {
            window.mathCaptcha.showError();
            document.getElementById('captcha').focus();
            return false;
        }
        
        // Collect form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (!data.name || !data.email || !data.message) {
            alert('Please fill in all required fields.');
            return false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Please enter a valid email address.');
            return false;
        }
        
        // Track form submission
        if (typeof sa_event === 'function') {
            sa_event('contact_form_submitted', {
                service: data.service,
                budget: data.budget,
                timeline: data.timeline,
                has_company: !!data.company,
                newsletter_signup: data.newsletter === 'yes'
            });
        }
        
        // Create mailto link
        const subject = encodeURIComponent(`Contact Form: ${data.service || 'General Inquiry'} - ${data.name}`);
        const body = encodeURIComponent(
            `New Contact Form Submission\n` +
            `========================\n\n` +
            `Name: ${data.name}\n` +
            `Email: ${data.email}\n` +
            `Phone: ${data.phone || 'Not provided'}\n` +
            `Company: ${data.company || 'Not provided'}\n` +
            `Service: ${data.service || 'Not specified'}\n` +
            `Budget: ${data.budget || 'Not specified'}\n` +
            `Timeline: ${data.timeline || 'Not specified'}\n` +
            `Newsletter: ${data.newsletter === 'yes' ? 'Yes' : 'No'}\n\n` +
            `Message:\n${data.message}\n\n` +
            `Submitted: ${new Date().toLocaleString()}\n` +
            `From: ${window.location.href}`
        );
        
        // Open email client
        window.location.href = `mailto:sales@anitechcs.com?subject=${subject}&body=${body}`;
        
        // Show success message
        alert('Thank you for your message! Your email client will now open. We\'ll get back to you within 24 hours.');
        
        // Reset form
        contactForm.reset();
        if (window.mathCaptcha) {
            window.mathCaptcha.reset();
        }
    });
}

// Custom Chat Widget Implementation
class CustomChatWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.responses = {
            'hello': 'Hello! Welcome to AnitechCS. How can I help you today?',
            'hi': 'Hi there! 👋 What can I do for you?',
            'pricing': 'Our pricing starts from $499 for basic websites. Would you like me to connect you with our sales team for a detailed quote?',
            'website': 'We specialize in custom website development! Our packages range from $499 to $2999. What type of website are you looking for?',
            'hosting': 'We offer reliable cloud hosting starting at $15/month. Our hosting includes 99.9% uptime, SSL certificates, and 24/7 support.',
            'support': 'I\'m here to help! For technical issues, you can also email us at support@anitechcs.com or call +1 (555) 123-4567.',
            'contact': 'You can reach us at:\n📧 sales@anitechcs.com\n📞 +1 (555) 123-4567\n📍 555 Mission Street, San Francisco, CA',
            'quote': 'I\'d be happy to help you get a quote! Please visit our contact page or email sales@anitechcs.com with your project details.',
            'services': 'We offer:\n• Website Development\n• Cloud Hosting\n• Maintenance & Support\n• ERP Integration\n• Digital Transformation',
            'hours': 'Our business hours are:\nMonday-Friday: 9 AM - 6 PM PST\nSaturday: 10 AM - 2 PM PST\nSunday: Closed\n\nBut you can contact us anytime!',
            'emergency': 'For urgent technical issues, call our emergency line: +1 (555) 911-HELP. Available 24/7 for critical website issues.',
            'team': 'Our team is led by Andrew Basil, Jimmy Mathew, and Mohmamed Rafik Alam. We have offices in 7 countries worldwide!',
            'locations': 'We have offices in California, Boston, Montreal, India, Philippines, Copenhagen, and Johannesburg.',
            'default': 'Thank you for your message! For immediate assistance, please email sales@anitechcs.com or call +1 (555) 123-4567. Our team will get back to you within 24 hours.'
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.showWelcomeNotification();
    }
    
    bindEvents() {
        const chatToggle = document.getElementById('chatToggle');
        const closeChat = document.getElementById('closeChat');
        const sendMessage = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');
        const quickReplies = document.querySelectorAll('.quick-reply');
        
        if (chatToggle) {
            chatToggle.addEventListener('click', () => this.toggleChat());
        }
        
        if (closeChat) {
            closeChat.addEventListener('click', () => this.closeChat());
        }
        
        if (sendMessage) {
            sendMessage.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        quickReplies.forEach(reply => {
            reply.addEventListener('click', () => {
                const message = reply.dataset.message;
                this.sendUserMessage(message);
                this.hideQuickReplies();
            });
        });
    }
    
    toggleChat() {
        const chatBox = document.getElementById('chatBox');
        const notification = document.getElementById('chatNotification');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            if (chatBox) {
                chatBox.style.display = 'flex';
                this.isOpen = true;
                if (notification) notification.style.display = 'none';
                
                const chatInput = document.getElementById('chatInput');
                if (chatInput) chatInput.focus();
                
                // Track analytics
                if (typeof sa_event === 'function') {
                    sa_event('chat_opened', {
                        page: window.location.pathname
                    });
                }
            }
        }
    }
    
    closeChat() {
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.style.display = 'none';
            this.isOpen = false;
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input ? input.value.trim() : '';
        
        if (message) {
            this.sendUserMessage(message);
            input.value = '';
        }
    }
    
    sendUserMessage(message) {
        this.addMessage(message, true);
        
        // Simulate typing indicator
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.getResponse(message);
            this.addMessage(response, false);
        }, 1500);
        
        // Track analytics
        if (typeof sa_event === 'function') {
            sa_event('chat_message_sent', {
                message_length: message.length,
                page: window.location.pathname
            });
        }
    }
    
    addMessage(message, isUser) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'bot-message';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="message-time">${timeString}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    getResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        for (let keyword in this.responses) {
            if (lowerMessage.includes(keyword)) {
                return this.responses[keyword];
            }
        }
        
        return this.responses['default'];
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    hideQuickReplies() {
        const quickReplies = document.getElementById('quickReplies');
        if (quickReplies) {
            quickReplies.style.display = 'none';
        }
    }
    
    showWelcomeNotification() {
        setTimeout(() => {
            const notification = document.getElementById('chatNotification');
            if (notification && !this.isOpen) {
                notification.style.display = 'flex';
            }
        }, 3000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing contact page enhancements...');
    
    // Initialize Math Captcha
    try {
        window.mathCaptcha = new MathCaptcha();
        console.log('✅ Math Captcha initialized');
    } catch (error) {
        console.warn('⚠️ Math Captcha initialization failed:', error);
    }
    
    // Initialize Interactive Map
    try {
        initializeMap();
        console.log('✅ Interactive Map initialized');
    } catch (error) {
        console.warn('⚠️ Map initialization failed:', error);
    }
    
    // Initialize FAQ Accordion
    try {
        initializeFAQ();
        console.log('✅ FAQ Accordion initialized');
    } catch (error) {
        console.warn('⚠️ FAQ initialization failed:', error);
    }
    
    // Initialize Contact Form
    try {
        initializeContactForm();
        console.log('✅ Contact Form initialized');
    } catch (error) {
        console.warn('⚠️ Contact Form initialization failed:', error);
    }
    
    // Initialize Custom Chat Widget
    try {
        window.customChat = new CustomChatWidget();
        console.log('✅ Custom Chat Widget initialized');
    } catch (error) {
        console.warn('⚠️ Chat Widget initialization failed:', error);
    }
    
    console.log('🎉 Contact page enhancements loaded successfully!');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MathCaptcha,
        CustomChatWidget,
        initializeMap,
        initializeFAQ,
        initializeContactForm
    };
}