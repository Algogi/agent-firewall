import type { Rule, RuleEvidence, RuleEffect, NormalizedInput } from '../interfaces/rule.js';

/**
 * Base Rule Implementation
 * 
 * Abstract base class for all rules.
 */
export abstract class BaseRule implements Rule {
  abstract readonly id: string;
  abstract readonly description: string;
  abstract readonly version: string;
  abstract readonly category: 'structural' | 'linguistic' | 'encoding' | 'contextual';

  /**
   * Evaluate the rule against normalized input.
   */
  evaluate(normalizedInput: NormalizedInput): RuleEvidence {
    const matched = this.condition(normalizedInput);
    const effect = matched ? this.getEffect() : undefined;
    const explanation = matched
      ? this.getExplanation(normalizedInput)
      : undefined;

    return {
      ruleId: this.id,
      matched,
      effect,
      explanation,
    };
  }

  /**
   * Check if the rule condition matches.
   * Must be implemented by subclasses.
   */
  protected abstract condition(normalizedInput: NormalizedInput): boolean;

  /**
   * Get the effect when this rule matches.
   * Must be implemented by subclasses.
   */
  abstract getEffect(): RuleEffect;

  /**
   * Get human-readable explanation of why the rule matched.
   */
  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return `Rule ${this.id} matched: ${this.description}`;
  }
}

