import { BaseRule } from '../base.js';
import type { NormalizedInput, RuleEffect } from '../../schemas/index.js';

/**
 * Detects suspicious role-playing or persona injection attempts.
 */
export class PersonaInjectionRule extends BaseRule {
  readonly id = 'contextual.persona-injection';
  readonly description = 'Detects attempts to inject personas or roles';
  readonly version = '1.0.0';
  readonly category = 'contextual' as const;

  private readonly personaPatterns = [
    /you\s+are\s+(a|an)\s+[a-z]+/i,
    /act\s+as\s+(a|an|the)\s+[a-z]+/i,
    /pretend\s+to\s+be/i,
    /roleplay\s+as/i,
    /from\s+now\s+on\s+you/i,
  ];

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized.toLowerCase();
    return this.personaPatterns.some((pattern) => pattern.test(text));
  }

  getEffect(): RuleEffect {
    return {
      score: 0.35,
      class: 'persona-injection',
      severity: 'high',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return 'Persona or role injection pattern detected';
  }
}

/**
 * Detects attempts to access system information or files.
 */
export class SystemAccessRule extends BaseRule {
  readonly id = 'contextual.system-access';
  readonly description = 'Detects attempts to access system resources';
  readonly version = '1.0.0';
  readonly category = 'contextual' as const;

  private readonly systemPatterns = [
    /(read|open|access|readfile|cat|type)\s+(file|directory|path|system)/i,
    /(\.\.\/|\.\.\\|\.\.\/\.\.)/, // Path traversal
    /(etc\/passwd|proc\/|sys\/|dev\/)/i, // Unix system paths
    /(c:\\|c:\/|%[a-z]+%)/i, // Windows paths and env vars
    /(eval|exec|system|shell|command)/i,
  ];

  protected condition(normalizedInput: NormalizedInput): boolean {
    const text = normalizedInput.normalized.toLowerCase();
    return this.systemPatterns.some((pattern) => pattern.test(text));
  }

  getEffect(): RuleEffect {
    return {
      score: 0.5,
      class: 'system-access-attempt',
      severity: 'critical',
    };
  }

  protected getExplanation(_normalizedInput: NormalizedInput): string {
    return 'System access or command execution pattern detected';
  }
}

