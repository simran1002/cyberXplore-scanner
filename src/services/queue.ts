import { EventEmitter } from 'events';
import { ScanJob } from '../types';

class InMemoryQueue extends EventEmitter {
  private queue: ScanJob[] = [];
  private processing = false;

  constructor() {
    super();
    this.startProcessing();
  }

  enqueue(job: ScanJob): void {
    this.queue.push(job);
    console.log(` Job enqueued: ${job.filename} (Queue size: ${this.queue.length})`);
    this.emit('job-added', job);
  }

  dequeue(): ScanJob | undefined {
    const job = this.queue.shift();
    if (job) {
      console.log(` Job dequeued: ${job.filename} (Queue size: ${this.queue.length})`);
    }
    return job;
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  private async startProcessing(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    console.log(' Queue processor started');

    while (true) {
      if (!this.isEmpty()) {
        const job = this.dequeue();
        if (job) {
          this.emit('job-processing', job);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  getQueueStatus() {
    return {
      size: this.size(),
      processing: this.processing,
      isEmpty: this.isEmpty()
    };
  }
}

export const scanQueue = new InMemoryQueue();
