import type {
  IntelligenceProvider,
  Signal,
  NormalizedInput,
  Context,
  Metadata,
} from '../interfaces/intelligence.js';
import {
  SignalSchema,
  IntelligenceRequestSchema,
} from '../schemas/index.js';

/**
 * Algogi Cloud ML API Provider
 * 
 * Connects to Algogi Cloud for ML-based threat intelligence.
 * Disabled by default. Requires explicit opt-in and API key.
 */
export class AlgogiCloudProvider implements IntelligenceProvider {
  readonly id = 'algogi-cloud';
  readonly enabled: boolean;

  private readonly apiKey: string | null;
  private readonly baseUrl: string;

  /**
   * Create an Algogi Cloud provider.
   * 
   * @param apiKey - Algogi Cloud API key (required if enabled)
   * @param enabled - Whether this provider is enabled (default: false)
   * @param baseUrl - Base URL for Algogi Cloud API (default: production)
   */
  constructor(
    apiKey: string | null = null,
    enabled: boolean = false,
    baseUrl: string = 'https://agent-firewall.algogi.com/api/v1'
  ) {
    this.apiKey = apiKey;
    this.enabled = enabled;
    this.baseUrl = baseUrl;

    if (enabled && !apiKey) {
      throw new Error(
        'Algogi Cloud provider requires an API key when enabled'
      );
    }
  }

  async analyze(
    normalizedInput: NormalizedInput,
    context: Context,
    metadata: Metadata
  ): Promise<Signal> {
    if (!this.enabled) {
      throw new Error('Algogi Cloud provider is not enabled');
    }

    if (!this.apiKey) {
      throw new Error('Algogi Cloud API key is required');
    }

    const request = IntelligenceRequestSchema.parse({
      prompt: normalizedInput.normalized,
      context,
      metadata,
    });

    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(
          `Algogi Cloud API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return SignalSchema.parse(data);
    } catch (error) {
      // On failure, return a neutral signal (fail open)
      return {
        noveltyScore: 0.0,
        predictedClasses: [],
        confidence: 0.0,
        modelId: this.id,
      };
    }
  }
}

