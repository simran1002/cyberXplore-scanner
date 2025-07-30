import axios from 'axios';
import { FileDocument } from '../types';

class NotificationService {
  private slackWebhookUrl: string | undefined;

  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  async sendAlert(file: FileDocument, threats: string[]): Promise<void> {
    const message = this.formatAlertMessage(file, threats);
    
    console.log('🚨 SECURITY ALERT:', message);

    // Send to Slack if webhook URL is configured
    if (this.slackWebhookUrl) {
      try {
        await this.sendSlackAlert(message, file, threats);
        console.log('✅ Slack alert sent successfully');
      } catch (error) {
        console.error('❌ Failed to send Slack alert:', error);
      }
    }

    // Could add other notification channels here (email, Discord, etc.)
  }

  private formatAlertMessage(file: FileDocument, threats: string[]): string {
    return `🚨 MALWARE DETECTED!\n` +
           `File: ${file.originalName}\n` +
           `Size: ${this.formatFileSize(file.size)}\n` +
           `Uploaded: ${file.uploadedAt.toISOString()}\n` +
           `Threats: ${threats.join(', ')}\n` +
           `Action Required: Review and quarantine file immediately.`;
  }

  private async sendSlackAlert(message: string, file: FileDocument, threats: string[]): Promise<void> {
    if (!this.slackWebhookUrl) return;

    const payload = {
      text: "🚨 CyberXplore Security Alert",
      attachments: [
        {
          color: "danger",
          title: "Malware Detection Alert",
          fields: [
            {
              title: "File Name",
              value: file.originalName,
              short: true
            },
            {
              title: "File Size",
              value: this.formatFileSize(file.size),
              short: true
            },
            {
              title: "Upload Time",
              value: file.uploadedAt.toISOString(),
              short: true
            },
            {
              title: "Scan Time",
              value: file.scannedAt?.toISOString() || 'N/A',
              short: true
            },
            {
              title: "Threats Detected",
              value: threats.join('\n• '),
              short: false
            }
          ],
          footer: "CyberXplore Malware Scanner",
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    await axios.post(this.slackWebhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Test notification method
  async testNotification(): Promise<void> {
    const testFile: FileDocument = {
      filename: 'test-malware.pdf',
      originalName: 'suspicious-document.pdf',
      path: '/uploads/test-malware.pdf',
      size: 1024000,
      mimetype: 'application/pdf',
      status: 'scanned',
      result: 'infected',
      uploadedAt: new Date(),
      scannedAt: new Date()
    };

    const testThreats = ['eval', 'malware', 'suspicious filename'];
    await this.sendAlert(testFile, testThreats);
  }
}

export const notificationService = new NotificationService();
