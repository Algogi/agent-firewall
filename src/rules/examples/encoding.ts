import { BaseRule } from '../base.js';
import type { NormalizedInput, RuleEffect } from '../../schemas/index.js';

/**
 * Detects Unicode homoglyph attacks (lookalike characters).
 */
export class HomoglyphRule extends BaseRule {
  readonly id = 'encoding.homoglyph';
  readonly description = 'Detects Unicode homoglyph characters';
  readonly version = '1.0.0';
  readonly category = 'encoding' as const;

  // Common homoglyph ranges (simplified for MVP)
  private readonly homoglyphRanges = [
    /[\u0430-\u044F]/, // Cyrillic lowercase (looks like Latin)
    /[\u0400-\u04FF]/, // Cyrillic
    /[\u2000-\u206F]/, // General Punctuation (invisible/zero-width)
    /[\u202A-\u202E]/, // Directional formatting
    /[\uFEFF]/, // Zero-width no-break space
  ];

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized;
    return this.homoglyphRanges.some((range) => range.test(text));
  }

  getEffect(): RuleEffect {
    return {
      score: 0.3,
      class: 'homoglyph-attack',
      severity: 'high',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return 'Unicode homoglyph or zero-width characters detected';
  }
}

/**
 * Detects mixed encoding indicators.
 */
export class MixedEncodingRule extends BaseRule {
  readonly id = 'encoding.mixed';
  readonly description = 'Detects mixed encoding indicators';
  readonly version = '1.0.0';
  readonly category = 'encoding' as const;

  // Patterns that suggest encoding issues
  private readonly encodingAnomalies = [
    /\ufffd/, // Replacement character
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/, // Control characters
    /\uFEFF/, // BOM
  ];

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized;
    return this.encodingAnomalies.some((pattern) => pattern.test(text));
  }

  getEffect(): RuleEffect {
    return {
      score: 0.2,
      class: 'encoding-anomaly',
      severity: 'medium',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return 'Encoding anomalies detected (replacement characters, BOM, etc.)';
  }
}

