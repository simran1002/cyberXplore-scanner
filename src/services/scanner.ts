import fs from 'fs/promises';
import path from 'path';
import File from '../models/File';
import { ScanResult } from '../types';
import { notificationService } from './notifications';

class MalwareScanner {
  private dangerousKeywords = [
    'rm -rf',
    'eval',
    'bitcoin',
    'malware',
    'virus',
    'trojan',
    'ransomware',
    'keylogger',
    'backdoor',
    'rootkit',
    'spyware',
    'worm',
    'exploit',
    'payload',
    'shell',
    'exec',
    'system',
    'cmd',
    'powershell',
    'wget',
    'curl',
    'download',
    'inject',
    'buffer overflow',
    'sql injection',
    'xss',
    'csrf'
  ];

  async scanFile(fileId: string, filePath: string): Promise<ScanResult> {
    console.log(`🔍 Starting scan for file: ${fileId}`);
    
    try {
      // Update status to scanning
      await File.findByIdAndUpdate(fileId, { 
        status: 'scanning' 
      });

      // Simulate scanning delay (2-5 seconds)
      const scanDuration = Math.random() * 3000 + 2000; // 2-5 seconds
      await new Promise(resolve => setTimeout(resolve, scanDuration));

      // Read file content for text-based files
      let fileContent = '';
      try {
        const stats = await fs.stat(filePath);
        if (stats.size < 1024 * 1024) { // Only read files smaller than 1MB
          const buffer = await fs.readFile(filePath);
          fileContent = buffer.toString('utf8', 0, Math.min(buffer.length, 10000)); // First 10KB
        }
      } catch (error) {
        console.log('Could not read file content for scanning:', error);
      }

      // Check for dangerous keywords
      const threats: string[] = [];
      const contentLower = fileContent.toLowerCase();
      
      for (const keyword of this.dangerousKeywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          threats.push(keyword);
        }
      }

      // Additional checks based on filename
      const filename = path.basename(filePath).toLowerCase();
      const suspiciousFilenames = ['virus', 'malware', 'trojan', 'hack', 'crack', 'keygen'];
      
      for (const suspicious of suspiciousFilenames) {
        if (filename.includes(suspicious)) {
          threats.push(`Suspicious filename: ${suspicious}`);
        }
      }

      // Determine result
      const result: 'clean' | 'infected' = threats.length > 0 ? 'infected' : 'clean';
      const scannedAt = new Date();

      // Update database
      const updatedFile = await File.findByIdAndUpdate(
        fileId,
        {
          status: 'scanned',
          result,
          scannedAt
        },
        { new: true }
      );

      console.log(`✅ Scan completed for ${fileId}: ${result.toUpperCase()}`);
      
      if (threats.length > 0) {
        console.log(`⚠️  Threats detected: ${threats.join(', ')}`);
      }

      // Send notification if infected
      if (result === 'infected' && updatedFile) {
        await notificationService.sendAlert(updatedFile, threats);
      }

      return {
        fileId,
        result,
        threats: threats.length > 0 ? threats : undefined,
        scannedAt
      };

    } catch (error) {
      console.error(`❌ Error scanning file ${fileId}:`, error);
      
      // Update status to scanned with error
      await File.findByIdAndUpdate(fileId, {
        status: 'scanned',
        result: 'clean', // Default to clean on error
        scannedAt: new Date()
      });

      throw error;
    }
  }

  async scanFileById(fileId: string): Promise<ScanResult> {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    return this.scanFile(fileId, file.path);
  }
}

export const malwareScanner = new MalwareScanner();
