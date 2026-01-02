import type { Signal, NormalizedInput, Context, Metadata } from '../schemas/index.js';

// Re-export types for convenience
export type { Signal, NormalizedInput, Context, Metadata };

/**
 * Intelligence Provider Interface
 * 
 * All intelligence providers (BYOM, Algogi Cloud, etc.) must implement this.
 * 
 * Signals are advisory only and never override deterministic rules.
 */
export interface IntelligenceProvider {
  /**
   * Analyze normalized input and return a signal.
   * 
   * @param normalizedInput - The normalized prompt text
   * @param context - Request context (role, channel, etc.)
   * @param metadata - Computed metadata (tokens, entropy, etc.)
   * @returns A signal with novelty score, predicted classes, and confidence
   */
  analyze(
    normalizedInput: NormalizedInput,
    context: Context,
    metadata: Metadata
  ): Promise<Signal>;

  /**
   * Provider identifier for explainability.
   */
  readonly id: string;

  /**
   * Whether this provider is enabled.
   */
  readonly enabled: boolean;
}

