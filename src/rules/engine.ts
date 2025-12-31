import type { Rule, RuleEvidence, NormalizedInput } from '../interfaces/rule.js';

/**
 * Rule Engine
 * 
 * Evaluates all rules against normalized input.
 * Rules are pure, deterministic, and independent.
 */
export class RuleEngine {
  private readonly rules: Rule[];

  constructor(rules: Rule[] = []) {
    this.rules = rules;
  }

  /**
   * Add a rule to the engine.
   */
  addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  /**
   * Evaluate all rules against normalized input.
   * 
   * @param normalizedInput - The normalized prompt text
   * @returns Array of evidence from all rules
   */
  evaluate(normalizedInput: NormalizedInput): RuleEvidence[] {
    return this.rules.map((rule) => rule.evaluate(normalizedInput));
  }

  /**
   * Get all registered rules.
   */
  getRules(): Rule[] {
    return [...this.rules];
  }

  /**
   * Get rules by category.
   */
  getRulesByCategory(category: Rule['category']): Rule[] {
    return this.rules.filter((rule) => rule.category === category);
  }
}

