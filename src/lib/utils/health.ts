import { supabase } from '../supabase.js';
import { logger } from './logger.js';
import { metrics } from './metrics.js';
import * as os from 'os';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
    };
    api: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      uptime: number;
      memory: {
        used: number;
        total: number;
      };
    };
  };
  timestamp: string;
}

export class HealthChecker {
  private static startTime = Date.now();

  static async check(): Promise<HealthStatus> {
    const dbStatus = await this.checkDatabase();
    const apiStatus = this.checkApiHealth();

    const status: HealthStatus = {
      status: 'healthy',
      services: {
        database: dbStatus,
        api: apiStatus
      },
      timestamp: new Date().toISOString()
    };

    // Determine overall status
    if (dbStatus.status === 'unhealthy' || apiStatus.status === 'unhealthy') {
      status.status = 'unhealthy';
    } else if (apiStatus.status === 'degraded') {
      status.status = 'degraded';
    }

    // Track metrics
    metrics.incrementCounter('health_check', { status: status.status });

    return status;
  }

  private static async checkDatabase(): Promise<HealthStatus['services']['database']> {
    try {
      const start = Date.now();
      const { data, error } = await supabase.rpc('ping');
      const latency = Date.now() - start;

      if (error) throw error;

      return { status: 'healthy', latency };
    } catch (error) {
      logger.error('Database health check failed', error);
      return { status: 'unhealthy' };
    }
  }

  private static checkApiHealth(): HealthStatus['services']['api'] {
    const used = process.memoryUsage();
    const total = os.totalmem();

    // Consider API degraded if memory usage is above 80%
    const memoryUsagePercent = (used.heapUsed / total) * 100;
    const status = memoryUsagePercent > 80 ? 'degraded' : 'healthy';

    return {
      status,
      uptime: Date.now() - this.startTime,
      memory: {
        used: used.heapUsed,
        total
      }
    };
  }
}