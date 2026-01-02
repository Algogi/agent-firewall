import type { NormalizedInput, RuleEffect, RuleEvidence } from '../schemas/index.js';

// Re-export types for convenience
export type { NormalizedInput, RuleEffect, RuleEvidence };

/**
 * Rule Interface
 * 
 * Rules are pure, deterministic functions that operate on normalized input.
 * They never call models, mutate state, or depend on other rules.
 */
export interface Rule {
  /**
   * Immutable rule identifier.
   */
  readonly id: string;

  /**
   * Human-readable description of what this rule detects.
   */
  readonly description: string;

  /**
   * Rule version for tracking changes.
   */
  readonly version: string;

  /**
   * Rule category for organization.
   */
  readonly category: 'structural' | 'linguistic' | 'encoding' | 'contextual';

  /**
   * Evaluate the rule against normalized input.
   * 
   * @param normalizedInput - The normalized prompt text
   * @returns Evidence of whether the rule matched and its effect
   */
  evaluate(normalizedInput: NormalizedInput): RuleEvidence;

  /**
   * Get the effect this rule produces when matched.
   */
  getEffect(): RuleEffect;
}

