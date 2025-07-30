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
      await File.findByIdAndUpdate(fileId, { 
        status: 'scanning' 
      });

      const scanDuration = Math.random() * 3000 + 2000; 
      await new Promise(resolve => setTimeout(resolve, scanDuration));

      let fileContent = '';
      try {
        const stats = await fs.stat(filePath);
        if (stats.size < 1024 * 1024) { 
          const buffer = await fs.readFile(filePath);
          fileContent = buffer.toString('utf8', 0, Math.min(buffer.length, 10000)); 
        }
      } catch (error) {
        console.log('Could not read file content for scanning:', error);
      }

      const threats: string[] = [];
      const contentLower = fileContent.toLowerCase();
      
      for (const keyword of this.dangerousKeywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          threats.push(keyword);
        }
      }

      const filename = path.basename(filePath).toLowerCase();
      const suspiciousFilenames = ['virus', 'malware', 'trojan', 'hack', 'crack', 'keygen'];
      
      for (const suspicious of suspiciousFilenames) {
        if (filename.includes(suspicious)) {
          threats.push(`Suspicious filename: ${suspicious}`);
        }
      }

      const result: 'clean' | 'infected' = threats.length > 0 ? 'infected' : 'clean';
      const scannedAt = new Date();

      const updatedFile = await File.findByIdAndUpdate(
        fileId,
        {
          status: 'scanned',
          result,
          scannedAt
        },
        { new: true }
      );

      console.log(`Scan completed for ${fileId}: ${result.toUpperCase()}`);
      
      if (threats.length > 0) {
        console.log(`  Threats detected: ${threats.join(', ')}`);
      }

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
      console.error(` Error scanning file ${fileId}:`, error);
      
      await File.findByIdAndUpdate(fileId, {
        status: 'scanned',
        result: 'clean', 
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
