import { BaseRule } from '../base.js';
import type { NormalizedInput, RuleEffect } from '../../schemas/index.js';

/**
 * Detects rapid language switching (potential obfuscation).
 */
export class LanguageSwitchingRule extends BaseRule {
  readonly id = 'linguistic.language-switching';
  readonly description = 'Detects rapid switching between languages';
  readonly version = '1.0.0';
  readonly category = 'linguistic' as const;

  // Basic Unicode ranges for common scripts
  private readonly scriptRanges = {
    latin: /[\u0000-\u007F\u0080-\u00FF\u0100-\u017F\u0180-\u024F]/,
    cyrillic: /[\u0400-\u04FF]/,
    arabic: /[\u0600-\u06FF]/,
    chinese: /[\u4E00-\u9FFF]/,
    japanese: /[\u3040-\u309F\u30A0-\u30FF]/,
    korean: /[\uAC00-\uD7AF]/,
  };

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized;
    const scripts = new Set<string>();

    for (const char of text) {
      for (const [script, range] of Object.entries(this.scriptRanges)) {
        if (range.test(char)) {
          scripts.add(script);
        }
      }
    }

    // Flag if more than 3 scripts detected in short text
    return scripts.size > 3 && text.length < 500;
  }

  getEffect(): RuleEffect {
    return {
      score: 0.2,
      class: 'linguistic-anomaly',
      severity: 'medium',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return 'Rapid language/script switching detected';
  }
}

/**
 * Detects excessive use of special characters (potential encoding obfuscation).
 */
export class SpecialCharacterDensityRule extends BaseRule {
  readonly id = 'linguistic.special-character-density';
  readonly description = 'Detects excessive use of special characters';
  readonly version = '1.0.0';
  readonly category = 'linguistic' as const;

  private readonly specialCharPattern = /[^\w\s]/g;
  private readonly threshold = 0.3; // 30% special characters

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized;
    if (text.length === 0) return false;

    const specialCount = (text.match(this.specialCharPattern) || []).length;
    const density = specialCount / text.length;

    return density > this.threshold;
  }

  getEffect(): RuleEffect {
    return {
      score: 0.25,
      class: 'encoding-suspicion',
      severity: 'medium',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return `Special character density exceeds ${this.threshold * 100}%`;
  }
}

