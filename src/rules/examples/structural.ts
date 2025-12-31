import { BaseRule } from '../base.js';
import type { NormalizedInput, RuleEffect } from '../../schemas/index.js';

/**
 * Detects excessive nesting of brackets/parentheses (potential obfuscation).
 */
export class ExcessiveNestingRule extends BaseRule {
  readonly id = 'structural.excessive-nesting';
  readonly description = 'Detects excessive nesting of brackets or parentheses';
  readonly version = '1.0.0';
  readonly category = 'structural' as const;

  private readonly maxNestingDepth = 5;

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized;
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of text) {
      if (char === '(' || char === '[' || char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === ')' || char === ']' || char === '}') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth > this.maxNestingDepth;
  }

  getEffect(): RuleEffect {
    return {
      score: 0.15,
      class: 'structural-anomaly',
      severity: 'medium',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return `Excessive nesting detected (depth > ${this.maxNestingDepth})`;
  }
}

/**
 * Detects suspicious instruction patterns (e.g., "ignore previous", "forget").
 */
export class InstructionOverrideRule extends BaseRule {
  readonly id = 'structural.instruction-override';
  readonly description = 'Detects attempts to override system instructions';
  readonly version = '1.0.0';
  readonly category = 'structural' as const;

  private readonly overridePatterns = [
    /ignore\s+(previous|all|above|prior)/i,
    /forget\s+(everything|all|that|previous)/i,
    /disregard\s+(previous|all|above)/i,
    /delete\s+(your|the|all)\s+(instructions|prompt|system)/i,
    /you\s+are\s+now/i,
    /new\s+instructions?:/i,
    /system\s*:\s*ignore/i,
  ];

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized.toLowerCase();
    return this.overridePatterns.some((pattern) => pattern.test(text));
  }

  getEffect(): RuleEffect {
    return {
      score: 0.4,
      class: 'instruction-injection',
      severity: 'high',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return 'Instruction override pattern detected';
  }
}

