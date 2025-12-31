import type { PolicyAction, PolicyThreshold } from '../schemas/index.js';

// Re-export types for convenience
export type { PolicyAction, PolicyThreshold };

/**
 * Policy Interface
 * 
 * Policies define what actions to take based on risk scores.
 * They are evaluated after rules and intelligence signals.
 */
export interface Policy {
  /**
   * Evaluate a risk score and return the action to take.
   * 
   * @param riskScore - The aggregated risk score (0.0-1.0)
   * @param confidence - Confidence in the score (0.0-1.0)
   * @returns The action to take
   */
  evaluate(riskScore: number, confidence: number): PolicyAction;

  /**
   * Get the policy thresholds.
   */
  getThresholds(): PolicyThreshold;

  /**
   * Policy identifier.
   */
  readonly id: string;

  /**
   * Policy version.
   */
  readonly version: string;
}

