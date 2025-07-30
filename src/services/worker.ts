import { scanQueue } from './queue';
import { malwareScanner } from './scanner';
import { ScanJob } from '../types';

class ScanWorker {
  private isRunning = false;

  start(): void {
    if (this.isRunning) {
      console.log('  Worker is already running');
      return;
    }

    this.isRunning = true;
    console.log(' Scan worker started');

    scanQueue.on('job-processing', async (job: ScanJob) => {
      await this.processJob(job);
    });

    process.on('SIGINT', () => {
      this.stop();
    });

    process.on('SIGTERM', () => {
      this.stop();
    });
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    console.log(' Scan worker stopped');
  }

  private async processJob(job: ScanJob): Promise<void> {
    try {
      console.log(` Processing scan job: ${job.filename}`);
      
      const result = await malwareScanner.scanFile(job.fileId, job.path);
      
      console.log(` Job completed: ${job.filename} - ${result.result.toUpperCase()}`);
      
      if (result.threats && result.threats.length > 0) {
        console.log(`  Threats found: ${result.threats.join(', ')}`);
      }

    } catch (error) {
      console.error(` Error processing job ${job.fileId}:`, error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      queueStatus: scanQueue.getQueueStatus()
    };
  }
}

export const scanWorker = new ScanWorker();
