import type {
  IntelligenceProvider,
  Signal,
  NormalizedInput,
  Context,
  Metadata,
} from '../interfaces/intelligence.js';
import { SignalSchema } from '../schemas/index.js';

/**
 * BYOM (Bring Your Own Model) Provider
 * 
 * Allows users to integrate their own local ML models.
 * Models must implement the IntelligenceProvider interface.
 */
export class BYOMProvider implements IntelligenceProvider {
  readonly id: string;
  readonly enabled: boolean;

  private readonly modelFn: (
    prompt: string,
    context: Context,
    metadata: Metadata
  ) => Promise<Signal>;

  /**
   * Create a BYOM provider.
   * 
   * @param id - Provider identifier
   * @param modelFn - Function that calls the user's model and returns a Signal
   * @param enabled - Whether this provider is enabled
   */
  constructor(
    id: string,
    modelFn: (
      prompt: string,
      context: Context,
      metadata: Metadata
    ) => Promise<Signal>,
    enabled: boolean = true
  ) {
    this.id = id;
    this.modelFn = modelFn;
    this.enabled = enabled;
  }

  async analyze(
    normalizedInput: NormalizedInput,
    context: Context,
    metadata: Metadata
  ): Promise<Signal> {
    if (!this.enabled) {
      throw new Error(`BYOM provider ${this.id} is not enabled`);
    }

    try {
      const signal = await this.modelFn(
        normalizedInput.normalized,
        context,
        metadata
      );

      // Validate signal schema
      return SignalSchema.parse(signal);
    } catch (error) {
      // On failure, return a neutral signal
      return {
        noveltyScore: 0.0,
        predictedClasses: [],
        confidence: 0.0,
        modelId: this.id,
      };
    }
  }
}

