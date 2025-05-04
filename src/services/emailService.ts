import { VisaApplication } from '../types';

interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  maxRetries?: number;
  retryDelay?: number;
  rateLimit?: number;
}

interface EmailTemplate {
  subject: string;
  body: string;
  html?: string;
}

interface EmailOptions {
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low';
}

interface EmailQueueItem {
  id: string;
  to: string;
  template: EmailTemplate;
  options?: EmailOptions;
  retries: number;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  sentAt?: Date;
}

class EmailService {
  private config: EmailConfig;
  private queue: EmailQueueItem[] = [];
  private isProcessing: boolean = false;
  private lastEmailSent: Date = new Date(0);

  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 5000; // 5 seconds
  private readonly DEFAULT_RATE_LIMIT = 100; // emails per minute

  constructor(config: EmailConfig) {
    this.config = {
      ...config,
      maxRetries: config.maxRetries || this.DEFAULT_MAX_RETRIES,
      retryDelay: config.retryDelay || this.DEFAULT_RETRY_DELAY,
      rateLimit: config.rateLimit || this.DEFAULT_RATE_LIMIT
    };
  }

  private async sendEmail(to: string, template: EmailTemplate, options?: EmailOptions): Promise<boolean> {
    try {
      // Check rate limit
      const now = new Date();
      const timeSinceLastEmail = now.getTime() - this.lastEmailSent.getTime();
      const minTimeBetweenEmails = (60 * 1000) / this.config.rateLimit!;

      if (timeSinceLastEmail < minTimeBetweenEmails) {
        await new Promise(resolve => setTimeout(resolve, minTimeBetweenEmails - timeSinceLastEmail));
      }

      // TODO: Implement actual email sending logic here
      // For now, we'll just log the email details
      console.log('Sending email:', {
        to,
        template,
        options,
        config: {
          ...this.config,
          smtpPass: '********' // Hide password in logs
        }
      });

      this.lastEmailSent = new Date();
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    try {
      const item = this.queue[0];
      
      try {
        const success = await this.sendEmail(item.to, item.template, item.options);
        
        if (success) {
          item.status = 'sent';
          item.sentAt = new Date();
          this.queue.shift(); // Remove the sent email from the queue
        } else {
          throw new Error('Failed to send email');
        }
      } catch (error) {
        item.retries++;
        item.error = error instanceof Error ? error.message : 'Unknown error';
        
        if (item.retries >= this.config.maxRetries!) {
          item.status = 'failed';
          this.queue.shift(); // Remove failed email from queue after max retries
        } else {
          // Move to end of queue for retry
          this.queue.push(this.queue.shift()!);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  private addToQueue(to: string, template: EmailTemplate, options?: EmailOptions): string {
    const id = Math.random().toString(36).substr(2, 9);
    const queueItem: EmailQueueItem = {
      id,
      to,
      template,
      options,
      retries: 0,
      status: 'pending'
    };

    this.queue.push(queueItem);
    this.processQueue();
    return id;
  }

  async sendVisaExpiryReminder(visa: VisaApplication, recipientEmail: string): Promise<string> {
    const daysUntilExpiry = Math.ceil(
      (new Date(visa.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const template: EmailTemplate = {
      subject: `Visa Expiry Reminder - ${visa.applicationNumber}`,
      body: `
        Dear Employee,

        This is a reminder that your visa (Application Number: ${visa.applicationNumber}) will expire in ${daysUntilExpiry} days.
        
        Visa Details:
        - Type: ${visa.type}
        - Country: ${visa.country}
        - Expiry Date: ${new Date(visa.endDate).toLocaleDateString()}
        
        Please ensure to initiate the renewal process at your earliest convenience.
        
        Best regards,
        CUBS Technical Contracting HR Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Visa Expiry Reminder</h2>
          <p>Dear Employee,</p>
          <p>This is a reminder that your visa (Application Number: <strong>${visa.applicationNumber}</strong>) will expire in <strong>${daysUntilExpiry} days</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444; margin-top: 0;">Visa Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Type:</strong> ${visa.type}</li>
              <li><strong>Country:</strong> ${visa.country}</li>
              <li><strong>Expiry Date:</strong> ${new Date(visa.endDate).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <p>Please ensure to initiate the renewal process at your earliest convenience.</p>
          <p>Best regards,<br>CUBS Technical Contracting HR Team</p>
        </div>
      `
    };

    return this.addToQueue(recipientEmail, template, { priority: 'high' });
  }

  async sendDocumentUploadNotification(
    recipientEmail: string,
    documentName: string,
    documentType: string,
    uploadedBy: string
  ): Promise<string> {
    const template: EmailTemplate = {
      subject: `New Document Uploaded - ${documentName}`,
      body: `
        Dear Employee,

        A new document has been uploaded to your profile.
        
        Document Details:
        - Name: ${documentName}
        - Type: ${documentType}
        - Uploaded by: ${uploadedBy}
        - Upload Date: ${new Date().toLocaleDateString()}
        
        You can view and download this document from your profile.
        
        Best regards,
        CUBS Technical Contracting HR Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Document Uploaded</h2>
          <p>Dear Employee,</p>
          <p>A new document has been uploaded to your profile.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444; margin-top: 0;">Document Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Name:</strong> ${documentName}</li>
              <li><strong>Type:</strong> ${documentType}</li>
              <li><strong>Uploaded by:</strong> ${uploadedBy}</li>
              <li><strong>Upload Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>
          
          <p>You can view and download this document from your profile.</p>
          <p>Best regards,<br>CUBS Technical Contracting HR Team</p>
        </div>
      `
    };

    return this.addToQueue(recipientEmail, template);
  }

  async sendWelcomeEmail(recipientEmail: string, name: string): Promise<string> {
    const template: EmailTemplate = {
      subject: 'Welcome to CUBS Technical Contracting',
      body: `
        Dear ${name},

        Welcome to CUBS Technical Contracting! We're excited to have you on board.
        
        To get started, please:
        1. Complete your profile
        2. Upload your required documents
        3. Review your visa information
        
        If you have any questions, please don't hesitate to contact our HR team.
        
        Best regards,
        CUBS Technical Contracting HR Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to CUBS Technical Contracting</h2>
          <p>Dear ${name},</p>
          <p>Welcome to CUBS Technical Contracting! We're excited to have you on board.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #444; margin-top: 0;">Getting Started:</h3>
            <ol style="padding-left: 20px;">
              <li>Complete your profile</li>
              <li>Upload your required documents</li>
              <li>Review your visa information</li>
            </ol>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact our HR team.</p>
          <p>Best regards,<br>CUBS Technical Contracting HR Team</p>
        </div>
      `
    };

    return this.addToQueue(recipientEmail, template, { priority: 'high' });
  }

  getQueueStatus(): EmailQueueItem[] {
    return [...this.queue];
  }

  getEmailStatus(emailId: string): EmailQueueItem | undefined {
    return this.queue.find(item => item.id === emailId);
  }
}

export default EmailService; 