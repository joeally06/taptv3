import { logger } from './logger.js';

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Metric[] = [];
  private readonly flushInterval: number = 60000; // 1 minute

  private constructor() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  trackTiming(name: string, duration: number, tags: Record<string, string> = {}) {
    this.metrics.push({
      name: `timing.${name}`,
      value: duration,
      timestamp: Date.now(),
      tags
    });
  }

  incrementCounter(name: string, tags: Record<string, string> = {}) {
    this.metrics.push({
      name: `counter.${name}`,
      value: 1,
      timestamp: Date.now(),
      tags
    });
  }

  private async flush() {
    if (this.metrics.length === 0) return;

    const metrics = [...this.metrics];
    this.metrics = [];

    try {
      logger.info('Flushing metrics', { count: metrics.length });
      // Here you would typically send metrics to your monitoring service
      // For now, we'll just log them
      console.log('Metrics:', JSON.stringify(metrics, null, 2));
    } catch (error) {
      logger.error('Failed to flush metrics', error);
    }
  }
}

export const metrics = MetricsCollector.getInstance();