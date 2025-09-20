// Email Integration Service
// Handles sending consultation requests via email for Cloud Services and Design Services

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailIntegrationService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
        
        // Email templates
        this.templates = {
            cloudConsultation: this.loadTemplate('cloud-consultation'),
            designConsultation: this.loadTemplate('design-consultation'),
            aiNewsDemo: this.loadTemplate('ai-news-demo'),
            notification: this.loadTemplate('notification')
        };
    }

    // Initialize email transporter
    async initializeTransporter() {
        try {
            // For production, use environment variables
            const emailConfig = {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER || 'kaitarefred123@gmail.com',
                    pass: process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            };

            this.transporter = nodemailer.createTransporter(emailConfig);

            // Verify connection
            await this.transporter.verify();
            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            
            // Fallback to console logging for development
            this.transporter = {
                sendMail: (options) => {
                    console.log('📧 Email would be sent (Development Mode):', {
                        to: options.to,
                        subject: options.subject,
                        text: options.text
                    });
                    return Promise.resolve({ messageId: 'dev-' + Date.now() });
                }
            };
        }
    }

    // Load email templates
    loadTemplate(templateName) {
        try {
            const templatePath = path.join(__dirname, '..', 'email-templates', `${templateName}.html`);
            if (fs.existsSync(templatePath)) {
                return fs.readFileSync(templatePath, 'utf8');
            }
        } catch (error) {
            console.warn(`Template ${templateName} not found, using default`);
        }
        return this.getDefaultTemplate(templateName);
    }

    // Default email templates
    getDefaultTemplate(templateName) {
        const templates = {
            'cloud-consultation': `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0ea5e9, #14b8a6); padding: 2rem; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; text-align: center;">☁️ Cloud Consultation Request</h1>
                        <p style="color: white; text-align: center; margin: 0.5rem 0 0;">KaiTech Voice of Time</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #1e293b;">New Cloud Services Consultation Request</h2>
                        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                            <h3 style="color: #0ea5e9; margin-top: 0;">Request Details</h3>
                            {{CONSULTATION_DETAILS}}
                        </div>
                        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 0.9rem;">
                                📧 This request was submitted through the KaiTech website<br>
                                ⏰ Please respond within 24 hours<br>
                                🔒 This information is confidential and should be handled according to company privacy policies
                            </p>
                        </div>
                    </div>
                </div>
            `,
            'design-consultation': `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #a855f7, #7c3aed); padding: 2rem; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; text-align: center;">🎨 Design Consultation Request</h1>
                        <p style="color: white; text-align: center; margin: 0.5rem 0 0;">KaiTech Creative Studio</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #1e293b;">New Design Services Consultation Request</h2>
                        <div style="background: #faf5ff; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                            <h3 style="color: #a855f7; margin-top: 0;">Request Details</h3>
                            {{CONSULTATION_DETAILS}}
                        </div>
                        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 0.9rem;">
                                📧 This request was submitted through the KaiTech website<br>
                                🎨 Creative consultation requested<br>
                                ⏰ Please respond within 24 hours<br>
                                🔒 This information is confidential
                            </p>
                        </div>
                    </div>
                </div>
            `,
            'ai-news-demo': `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #8b5cf6, #a855f7); padding: 2rem; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; text-align: center;">🤖 AI News Demo Request</h1>
                        <p style="color: white; text-align: center; margin: 0.5rem 0 0;">Voice of Time AI</p>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <h2 style="color: #1e293b;">New AI Demo Request</h2>
                        <div style="background: #f3e8ff; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                            <h3 style="color: #8b5cf6; margin-top: 0;">Request Details</h3>
                            {{CONSULTATION_DETAILS}}
                        </div>
                        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 0.9rem;">
                                📧 AI demo request from KaiTech website<br>
                                🤖 AI-powered news intelligence demo requested<br>
                                ⏰ Schedule demo within 24 hours<br>
                                🔒 Business information - handle confidentially
                            </p>
                        </div>
                    </div>
                </div>
            `,
            'notification': `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1e293b; padding: 2rem; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; text-align: center;">KaiTech Notification</h1>
                    </div>
                    <div style="background: white; padding: 2rem; border-radius: 0 0 10px 10px;">
                        {{NOTIFICATION_CONTENT}}
                    </div>
                </div>
            `
        };

        return templates[templateName] || templates['notification'];
    }

    // Send cloud consultation email
    async sendCloudConsultationEmail(formData) {
        try {
            const consultationDetails = this.formatCloudConsultationDetails(formData);
            const htmlContent = this.templates.cloudConsultation.replace('{{CONSULTATION_DETAILS}}', consultationDetails);

            const mailOptions = {
                from: `"KaiTech Cloud Services" <${process.env.EMAIL_USER || 'kaitarefred123@gmail.com'}>`,
                to: process.env.CLOUD_EMAIL || 'cloud@kaitech.com',
                cc: process.env.NOTIFICATION_EMAIL || 'kaitarefred123@gmail.com',
                subject: `☁️ Cloud Consultation Request - ${formData.company || 'New Client'}`,
                html: htmlContent,
                text: this.createTextVersion(consultationDetails)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Cloud consultation email sent:', result.messageId);

            // Send confirmation to client
            await this.sendConsultationConfirmation(formData.email, 'cloud');

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send cloud consultation email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send design consultation email
    async sendDesignConsultationEmail(formData) {
        try {
            const consultationDetails = this.formatDesignConsultationDetails(formData);
            const htmlContent = this.templates.designConsultation.replace('{{CONSULTATION_DETAILS}}', consultationDetails);

            const mailOptions = {
                from: `"KaiTech Creative Studio" <${process.env.EMAIL_USER || 'kaitarefred123@gmail.com'}>`,
                to: process.env.DESIGN_EMAIL || 'design@kaitech.com',
                cc: process.env.NOTIFICATION_EMAIL || 'kaitarefred123@gmail.com',
                subject: `🎨 Design Consultation Request - ${formData.company || 'New Client'}`,
                html: htmlContent,
                text: this.createTextVersion(consultationDetails)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Design consultation email sent:', result.messageId);

            // Send confirmation to client
            await this.sendConsultationConfirmation(formData.email, 'design');

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send design consultation email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send AI demo request email
    async sendAIDemoRequestEmail(formData) {
        try {
            const consultationDetails = this.formatAIDemoDetails(formData);
            const htmlContent = this.templates.aiNewsDemo.replace('{{CONSULTATION_DETAILS}}', consultationDetails);

            const mailOptions = {
                from: `"Voice of Time AI" <${process.env.EMAIL_USER || 'kaitarefred123@gmail.com'}>`,
                to: process.env.AI_EMAIL || 'ai-demo@kaitech.com',
                cc: process.env.NOTIFICATION_EMAIL || 'kaitarefred123@gmail.com',
                subject: `🤖 AI News Demo Request - ${formData.company || 'New Client'}`,
                html: htmlContent,
                text: this.createTextVersion(consultationDetails)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ AI demo request email sent:', result.messageId);

            // Send confirmation to client
            await this.sendConsultationConfirmation(formData.email, 'ai-demo');

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send AI demo request email:', error);
            return { success: false, error: error.message };
        }
    }

    // Format cloud consultation details
    formatCloudConsultationDetails(formData) {
        return `
            <div style="margin-bottom: 1rem;">
                <strong>👤 Contact Information:</strong><br>
                <div style="margin-left: 1rem;">
                    Name: ${formData.name || 'Not provided'}<br>
                    Email: ${formData.email || 'Not provided'}<br>
                    Phone: ${formData.phone || 'Not provided'}<br>
                    Company: ${formData.company || 'Not provided'}<br>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>☁️ Cloud Services Interest:</strong><br>
                <div style="margin-left: 1rem;">
                    Service Type: ${formData.serviceType || 'General consultation'}<br>
                    Current Infrastructure: ${formData.currentInfrastructure || 'Not specified'}<br>
                    Budget Range: ${formData.budgetRange || 'To be discussed'}<br>
                    Timeline: ${formData.timeline || 'Not specified'}<br>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>📝 Additional Details:</strong><br>
                <div style="margin-left: 1rem; background: #f1f5f9; padding: 1rem; border-radius: 8px;">
                    ${formData.message || 'No additional details provided'}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>⏰ Submission Details:</strong><br>
                <div style="margin-left: 1rem;">
                    Date: ${new Date().toLocaleDateString()}<br>
                    Time: ${new Date().toLocaleTimeString()}<br>
                    Source: KaiTech Website - Cloud Services Section<br>
                </div>
            </div>
        `;
    }

    // Format design consultation details
    formatDesignConsultationDetails(formData) {
        return `
            <div style="margin-bottom: 1rem;">
                <strong>👤 Contact Information:</strong><br>
                <div style="margin-left: 1rem;">
                    Name: ${formData.name || 'Not provided'}<br>
                    Email: ${formData.email || 'Not provided'}<br>
                    Phone: ${formData.phone || 'Not provided'}<br>
                    Company: ${formData.company || 'Not provided'}<br>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>🎨 Design Services Interest:</strong><br>
                <div style="margin-left: 1rem;">
                    Service Type: ${formData.designType || 'General design consultation'}<br>
                    Project Scope: ${formData.projectScope || 'Not specified'}<br>
                    Budget Range: ${formData.budgetRange || 'To be discussed'}<br>
                    Timeline: ${formData.timeline || 'Not specified'}<br>
                    Industry: ${formData.industry || 'Not specified'}<br>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>📝 Project Details:</strong><br>
                <div style="margin-left: 1rem; background: #faf5ff; padding: 1rem; border-radius: 8px;">
                    ${formData.message || 'No additional project details provided'}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>⏰ Submission Details:</strong><br>
                <div style="margin-left: 1rem;">
                    Date: ${new Date().toLocaleDateString()}<br>
                    Time: ${new Date().toLocaleTimeString()}<br>
                    Source: KaiTech Website - Media & Design Section<br>
                </div>
            </div>
        `;
    }

    // Format AI demo request details
    formatAIDemoDetails(formData) {
        return `
            <div style="margin-bottom: 1rem;">
                <strong>👤 Contact Information:</strong><br>
                <div style="margin-left: 1rem;">
                    Name: ${formData.name || 'Not provided'}<br>
                    Email: ${formData.email || 'Not provided'}<br>
                    Company: ${formData.company || 'Not provided'}<br>
                    Industry: ${formData.industry || 'Not specified'}<br>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>🤖 AI Demo Interest:</strong><br>
                <div style="margin-left: 1rem;">
                    Demo Type: Voice of Time AI News Intelligence<br>
                    Industry Focus: ${formData.industry || 'General'}<br>
                    Use Case: ${formData.useCase || 'News analysis and intelligence'}<br>
                    Team Size: ${formData.teamSize || 'Not specified'}<br>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>📝 Additional Requirements:</strong><br>
                <div style="margin-left: 1rem; background: #f3e8ff; padding: 1rem; border-radius: 8px;">
                    ${formData.requirements || 'Standard AI demo requested'}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>⏰ Submission Details:</strong><br>
                <div style="margin-left: 1rem;">
                    Date: ${new Date().toLocaleDateString()}<br>
                    Time: ${new Date().toLocaleTimeString()}<br>
                    Source: KaiTech Website - AI News Demo Section<br>
                </div>
            </div>
        `;
    }

    // Send confirmation email to client
    async sendConsultationConfirmation(clientEmail, consultationType) {
        if (!clientEmail) return;

        try {
            const confirmationContent = this.getConfirmationContent(consultationType);
            const mailOptions = {
                from: `"KaiTech" <${process.env.EMAIL_USER || 'kaitarefred123@gmail.com'}>`,
                to: clientEmail,
                subject: `✅ Consultation Request Received - KaiTech ${consultationType.charAt(0).toUpperCase() + consultationType.slice(1)}`,
                html: confirmationContent.html,
                text: confirmationContent.text
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Confirmation email sent to client:', clientEmail);
        } catch (error) {
            console.error('❌ Failed to send confirmation email:', error);
        }
    }

    // Get confirmation content based on consultation type
    getConfirmationContent(consultationType) {
        const typeConfig = {
            cloud: {
                emoji: '☁️',
                title: 'Cloud Services Consultation',
                color: '#0ea5e9',
                services: ['Infrastructure Assessment', 'Migration Planning', 'Security Analysis', 'Cost Optimization']
            },
            design: {
                emoji: '🎨',
                title: 'Creative Design Consultation',
                color: '#a855f7',
                services: ['Brand Identity', 'Web Design', 'Creative Strategy', 'Visual Assets']
            },
            'ai-demo': {
                emoji: '🤖',
                title: 'AI News Intelligence Demo',
                color: '#8b5cf6',
                services: ['Sentiment Analysis', 'Smart Summarization', 'Trend Detection', 'Personalization']
            }
        };

        const config = typeConfig[consultationType] || typeConfig.cloud;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${config.color}; padding: 2rem; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">${config.emoji} Thank You!</h1>
                    <p style="color: white; margin: 0.5rem 0 0;">Your ${config.title} request has been received</p>
                </div>
                <div style="background: white; padding: 2rem; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <h2 style="color: #1e293b;">What happens next?</h2>
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                        <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                            <li>📞 Our specialist will contact you within 24 hours</li>
                            <li>📅 We'll schedule a consultation at your convenience</li>
                            <li>🎯 Personalized recommendations for your needs</li>
                            <li>💡 Custom solution proposals and next steps</li>
                        </ul>
                    </div>
                    <div style="background: ${config.color}15; padding: 1.5rem; border-radius: 10px; margin: 1rem 0;">
                        <h3 style="color: ${config.color}; margin-top: 0;">What we'll cover:</h3>
                        <div style="display: grid; gap: 0.5rem;">
                            ${config.services.map(service => `<div style="color: #475569;">✨ ${service}</div>`).join('')}
                        </div>
                    </div>
                    <div style="text-align: center; margin: 2rem 0;">
                        <p style="color: #64748b;">Need immediate assistance?</p>
                        <p style="color: ${config.color}; font-weight: bold;">
                            📧 Email: ${consultationType}@kaitech.com<br>
                            📞 Phone: +1 (555) 123-TECH
                        </p>
                    </div>
                </div>
            </div>
        `;

        const text = `
Thank You! Your ${config.title} request has been received.

What happens next:
- Our specialist will contact you within 24 hours
- We'll schedule a consultation at your convenience  
- Personalized recommendations for your needs
- Custom solution proposals and next steps

What we'll cover:
${config.services.map(service => `- ${service}`).join('\n')}

Need immediate assistance?
Email: ${consultationType}@kaitech.com
Phone: +1 (555) 123-TECH

Best regards,
The KaiTech Team
        `;

        return { html, text };
    }

    // Create text version of email
    createTextVersion(htmlContent) {
        return htmlContent
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Health check
    async healthCheck() {
        try {
            if (this.transporter && this.transporter.verify) {
                await this.transporter.verify();
                return { status: 'healthy', message: 'Email service is operational' };
            } else {
                return { status: 'development', message: 'Running in development mode' };
            }
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

// Create singleton instance
const emailService = new EmailIntegrationService();

module.exports = emailService;
