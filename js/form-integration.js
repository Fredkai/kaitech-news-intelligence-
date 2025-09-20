// KaiTech Form Integration
// Frontend JavaScript for handling consultation form submissions

class FormIntegration {
    constructor() {
        this.API_BASE_URL = this.getApiBaseUrl();
        this.isSubmitting = false;
        this.initializeForms();
    }

    // Determine API base URL based on environment
    getApiBaseUrl() {
        // Check if running on localhost or development
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        // In production, use the same domain with different port or subdomain
        return `${location.protocol}//${location.hostname}:3001`;
    }

    // Initialize all forms on the page
    initializeForms() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupFormHandlers());
        } else {
            this.setupFormHandlers();
        }
    }

    // Setup form event handlers
    setupFormHandlers() {
        // Cloud Services consultation form
        this.setupFormHandler('cloud-consultation-form', this.handleCloudConsultation.bind(this));
        
        // Design Services consultation form
        this.setupFormHandler('design-consultation-form', this.handleDesignConsultation.bind(this));
        
        // AI Demo request form (if exists)
        this.setupFormHandler('ai-demo-form', this.handleAIDemoRequest.bind(this));
        
        // General contact form (fallback)
        this.setupFormHandler('contact-form', this.handleGeneralContact.bind(this));

        console.log('✅ KaiTech Form Integration initialized');
        console.log('📡 API Base URL:', this.API_BASE_URL);
    }

    // Setup individual form handler
    setupFormHandler(formId, handler) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!this.isSubmitting) {
                    handler(form, e);
                }
            });
            console.log(`📋 Form handler setup for: ${formId}`);
        }
    }

    // Handle cloud consultation form submission
    async handleCloudConsultation(form, event) {
        try {
            this.setSubmissionState(true, form);
            const formData = this.extractFormData(form);
            
            // Add specific fields for cloud consultation
            const cloudData = {
                ...formData,
                serviceType: form.querySelector('select[name="serviceType"]')?.value || 'General consultation',
                currentInfrastructure: form.querySelector('textarea[name="currentInfrastructure"]')?.value || '',
                budgetRange: form.querySelector('select[name="budgetRange"]')?.value || 'To be discussed',
                timeline: form.querySelector('select[name="timeline"]')?.value || 'Not specified'
            };

            console.log('☁️ Submitting cloud consultation:', cloudData);

            const response = await this.submitForm('/api/contact/cloud-consultation', cloudData);
            
            if (response.success) {
                this.showSuccessMessage(form, '☁️ Cloud Consultation Request Sent!', response.message);
                this.resetForm(form);
                
                // Track success (optional analytics)
                this.trackFormSuccess('cloud-consultation', cloudData);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('❌ Cloud consultation submission error:', error);
            this.showErrorMessage(form, 'Failed to send consultation request. Please try again.', error.message);
        } finally {
            this.setSubmissionState(false, form);
        }
    }

    // Handle design consultation form submission
    async handleDesignConsultation(form, event) {
        try {
            this.setSubmissionState(true, form);
            const formData = this.extractFormData(form);
            
            // Add specific fields for design consultation
            const designData = {
                ...formData,
                designType: form.querySelector('select[name="designType"]')?.value || 'General design consultation',
                projectScope: form.querySelector('textarea[name="projectScope"]')?.value || '',
                budgetRange: form.querySelector('select[name="budgetRange"]')?.value || 'To be discussed',
                timeline: form.querySelector('select[name="timeline"]')?.value || 'Not specified',
                industry: form.querySelector('select[name="industry"]')?.value || 'Not specified'
            };

            console.log('🎨 Submitting design consultation:', designData);

            const response = await this.submitForm('/api/contact/design-consultation', designData);
            
            if (response.success) {
                this.showSuccessMessage(form, '🎨 Design Consultation Request Sent!', response.message);
                this.resetForm(form);
                
                // Track success
                this.trackFormSuccess('design-consultation', designData);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('❌ Design consultation submission error:', error);
            this.showErrorMessage(form, 'Failed to send consultation request. Please try again.', error.message);
        } finally {
            this.setSubmissionState(false, form);
        }
    }

    // Handle AI demo request form submission
    async handleAIDemoRequest(form, event) {
        try {
            this.setSubmissionState(true, form);
            const formData = this.extractFormData(form);
            
            // Add specific fields for AI demo
            const aiData = {
                ...formData,
                industry: form.querySelector('select[name="industry"]')?.value || 'General',
                useCase: form.querySelector('textarea[name="useCase"]')?.value || 'News analysis and intelligence',
                teamSize: form.querySelector('select[name="teamSize"]')?.value || 'Not specified',
                requirements: form.querySelector('textarea[name="requirements"]')?.value || 'Standard AI demo requested'
            };

            console.log('🤖 Submitting AI demo request:', aiData);

            const response = await this.submitForm('/api/contact/ai-demo', aiData);
            
            if (response.success) {
                this.showSuccessMessage(form, '🤖 AI Demo Request Sent!', response.message);
                this.resetForm(form);
                
                // Track success
                this.trackFormSuccess('ai-demo', aiData);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('❌ AI demo request submission error:', error);
            this.showErrorMessage(form, 'Failed to send demo request. Please try again.', error.message);
        } finally {
            this.setSubmissionState(false, form);
        }
    }

    // Handle general contact form submission
    async handleGeneralContact(form, event) {
        try {
            this.setSubmissionState(true, form);
            const formData = this.extractFormData(form);
            
            console.log('📬 Submitting general contact:', formData);

            const response = await this.submitForm('/api/contact/general', formData);
            
            if (response.success) {
                this.showSuccessMessage(form, '📬 Message Sent!', response.message);
                this.resetForm(form);
                
                // Track success
                this.trackFormSuccess('general-contact', formData);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('❌ General contact submission error:', error);
            this.showErrorMessage(form, 'Failed to send message. Please try again.', error.message);
        } finally {
            this.setSubmissionState(false, form);
        }
    }

    // Extract form data from form element
    extractFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to regular object
        for (let [key, value] of formData.entries()) {
            // Trim whitespace from string values
            data[key] = typeof value === 'string' ? value.trim() : value;
        }
        
        // Add timestamp
        data.timestamp = new Date().toISOString();
        
        return data;
    }

    // Submit form data to API
    async submitForm(endpoint, data) {
        try {
            const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'same-origin' // Include cookies if needed
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to server. Please check your internet connection and try again.');
            }
            throw error;
        }
    }

    // Set form submission state
    setSubmissionState(isSubmitting, form) {
        this.isSubmitting = isSubmitting;
        
        const submitButton = form.querySelector('button[type="submit"]');
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        
        submitButtons.forEach(button => {
            if (isSubmitting) {
                button.disabled = true;
                button.dataset.originalText = button.textContent || button.value;
                
                if (button.tagName === 'BUTTON') {
                    button.innerHTML = '⏳ Sending...';
                } else {
                    button.value = 'Sending...';
                }
            } else {
                button.disabled = false;
                
                if (button.tagName === 'BUTTON') {
                    button.innerHTML = button.dataset.originalText || 'Send Message';
                } else {
                    button.value = button.dataset.originalText || 'Send Message';
                }
            }
        });

        // Add/remove loading class to form
        if (isSubmitting) {
            form.classList.add('form-submitting');
        } else {
            form.classList.remove('form-submitting');
        }
    }

    // Show success message
    showSuccessMessage(form, title, message) {
        this.showMessage(form, 'success', title, message);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
            this.hideMessage(form);
        }, 5000);
    }

    // Show error message
    showErrorMessage(form, title, details) {
        this.showMessage(form, 'error', title, details);
    }

    // Show message (generic)
    showMessage(form, type, title, message) {
        // Remove existing messages
        this.hideMessage(form);
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message--${type}`;
        messageDiv.innerHTML = `
            <div class="form-message__content">
                <h4 class="form-message__title">${title}</h4>
                <p class="form-message__text">${message}</p>
                <button class="form-message__close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Insert message after form
        form.parentNode.insertBefore(messageDiv, form.nextSibling);
        
        // Add CSS if not already present
        this.addMessageStyles();
        
        // Scroll message into view
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Hide message
    hideMessage(form) {
        const existingMessage = form.parentNode.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // Reset form
    resetForm(form) {
        form.reset();
        
        // Clear any custom validations
        form.querySelectorAll('.form-error').forEach(error => error.remove());
        form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    }

    // Add message styles (if not in CSS)
    addMessageStyles() {
        if (document.getElementById('form-integration-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'form-integration-styles';
        styles.textContent = `
            .form-message {
                margin: 1rem 0;
                padding: 1rem;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .form-message--success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            
            .form-message--error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            
            .form-message__content {
                position: relative;
                padding-right: 2rem;
            }
            
            .form-message__title {
                margin: 0 0 0.5rem;
                font-size: 1.1rem;
                font-weight: 600;
            }
            
            .form-message__text {
                margin: 0;
                line-height: 1.5;
            }
            
            .form-message__close {
                position: absolute;
                top: 0;
                right: 0;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 2rem;
                height: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .form-submitting {
                opacity: 0.7;
                pointer-events: none;
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Track form success (optional analytics)
    trackFormSuccess(formType, data) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'engagement',
                event_label: formType,
                value: 1
            });
        }
        
        // Console log for development
        console.log(`✅ Form submission tracked: ${formType}`);
    }

    // Health check for email server
    async checkServerHealth() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/health`);
            const data = await response.json();
            console.log('📊 Email server health:', data);
            return data;
        } catch (error) {
            console.warn('⚠️ Email server health check failed:', error);
            return null;
        }
    }
}

// Initialize form integration when script loads
const kaiTechForms = new FormIntegration();

// Expose for debugging
window.kaiTechForms = kaiTechForms;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormIntegration;
}
