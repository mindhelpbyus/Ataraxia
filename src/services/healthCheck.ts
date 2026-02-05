/**
 * Health Check Service
 * 
 * Verifies API connectivity, authentication providers, and system health
 * on application startup and periodically during runtime
 */

import { logger } from './secureLogger';
import { auth } from './firebase';
import { CognitoIdentityProviderClient, DescribeUserPoolCommand } from '@aws-sdk/client-cognito-identity-provider';

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    apiGateway: ServiceHealth;
    firebase: ServiceHealth;
    cognito: ServiceHealth;
    database: ServiceHealth;
  };
  lastCheck: Date;
  nextCheck?: Date;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
  lastCheck: Date;
  details?: any;
}

class HealthCheckService {
  private healthStatus: HealthStatus;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly TIMEOUT = 10000; // 10 seconds
  private cognitoClient: CognitoIdentityProviderClient;

  constructor() {
    this.healthStatus = {
      overall: 'unknown',
      services: {
        apiGateway: { status: 'unknown', lastCheck: new Date() },
        firebase: { status: 'unknown', lastCheck: new Date() },
        cognito: { status: 'unknown', lastCheck: new Date() },
        database: { status: 'unknown', lastCheck: new Date() }
      },
      lastCheck: new Date()
    };

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: import.meta.env.VITE_AWS_REGION || 'us-west-2'
    });
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthStatus> {
    logger.info('Starting health check');
    const startTime = Date.now();

    try {
      // Run all health checks in parallel
      const [apiHealth, firebaseHealth, cognitoHealth, dbHealth] = await Promise.allSettled([
        this.checkApiGateway(),
        this.checkFirebase(),
        this.checkCognito(),
        this.checkDatabase()
      ]);

      // Update health status
      this.healthStatus = {
        overall: this.calculateOverallHealth([
          apiHealth.status === 'fulfilled' ? apiHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' },
          firebaseHealth.status === 'fulfilled' ? firebaseHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' },
          cognitoHealth.status === 'fulfilled' ? cognitoHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' },
          dbHealth.status === 'fulfilled' ? dbHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' }
        ]),
        services: {
          apiGateway: apiHealth.status === 'fulfilled' ? apiHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' },
          firebase: firebaseHealth.status === 'fulfilled' ? firebaseHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' },
          cognito: cognitoHealth.status === 'fulfilled' ? cognitoHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' },
          database: dbHealth.status === 'fulfilled' ? dbHealth.value : { status: 'unhealthy', lastCheck: new Date(), error: 'Check failed' }
        },
        lastCheck: new Date(),
        nextCheck: new Date(Date.now() + this.CHECK_INTERVAL)
      };

      const duration = Date.now() - startTime;
      logger.info('Health check completed', {
        overall: this.healthStatus.overall,
        duration,
        services: Object.entries(this.healthStatus.services).map(([name, health]) => ({
          name,
          status: health.status,
          responseTime: health.responseTime
        }))
      });

      return this.healthStatus;

    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });
      
      this.healthStatus = {
        overall: 'unhealthy',
        services: {
          apiGateway: { status: 'unknown', lastCheck: new Date(), error: 'Health check failed' },
          firebase: { status: 'unknown', lastCheck: new Date(), error: 'Health check failed' },
          cognito: { status: 'unknown', lastCheck: new Date(), error: 'Health check failed' },
          database: { status: 'unknown', lastCheck: new Date(), error: 'Health check failed' }
        },
        lastCheck: new Date()
      };

      return this.healthStatus;
    }
  }

  /**
   * Check API Gateway health
   */
  private async checkApiGateway(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://zojyvoao3c.execute-api.us-west-2.amazonaws.com/dev';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          responseTime,
          lastCheck: new Date(),
          details: data
        };
      } else {
        return {
          status: response.status >= 500 ? 'unhealthy' : 'degraded',
          responseTime,
          lastCheck: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  }

  /**
   * Check Firebase health
   */
  private async checkFirebase(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // Check if Firebase is configured
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
      };

      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          error: 'Firebase not configured'
        };
      }

      // Test Firebase Auth connectivity
      const testUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken: 'test' }), // This will fail but confirms API is reachable
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // We expect a 400 error for invalid token, which means Firebase is reachable
      if (response.status === 400) {
        return {
          status: 'healthy',
          responseTime,
          lastCheck: new Date(),
          details: { projectId: firebaseConfig.projectId }
        };
      }

      return {
        status: 'degraded',
        responseTime,
        lastCheck: new Date(),
        error: `Unexpected response: ${response.status}`
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  }

  /**
   * Check Cognito health
   */
  private async checkCognito(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
      
      if (!userPoolId) {
        return {
          status: 'unhealthy',
          lastCheck: new Date(),
          error: 'Cognito not configured'
        };
      }

      const command = new DescribeUserPoolCommand({
        UserPoolId: userPoolId
      });

      await this.cognitoClient.send(command);
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date(),
        details: { userPoolId }
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Check database health via API
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://zojyvoao3c.execute-api.us-west-2.amazonaws.com/dev';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(`${apiUrl}/health/database`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          responseTime,
          lastCheck: new Date(),
          details: data
        };
      } else {
        return {
          status: 'unhealthy',
          responseTime,
          lastCheck: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallHealth(services: ServiceHealth[]): 'healthy' | 'degraded' | 'unhealthy' {
    const statuses = services.map(s => s.status);
    
    if (statuses.every(s => s === 'healthy')) {
      return 'healthy';
    }
    
    if (statuses.some(s => s === 'unhealthy')) {
      return 'unhealthy';
    }
    
    return 'degraded';
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Perform initial check
    this.performHealthCheck();

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.CHECK_INTERVAL);

    logger.info('Periodic health checks started', { 
      interval: this.CHECK_INTERVAL / 1000 + 's' 
    });
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Periodic health checks stopped');
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    return this.healthStatus;
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    return this.healthStatus.overall === 'healthy';
  }

  /**
   * Check if specific service is healthy
   */
  isServiceHealthy(service: keyof HealthStatus['services']): boolean {
    return this.healthStatus.services[service].status === 'healthy';
  }

  /**
   * Get unhealthy services
   */
  getUnhealthyServices(): Array<{ name: string; status: string; error?: string }> {
    return Object.entries(this.healthStatus.services)
      .filter(([_, health]) => health.status !== 'healthy')
      .map(([name, health]) => ({
        name,
        status: health.status,
        error: health.error
      }));
  }
}

// Export singleton instance
export const healthCheckService = new HealthCheckService();
export default healthCheckService;