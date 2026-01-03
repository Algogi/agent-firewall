import type { RuleEvidence, Signal } from '../schemas/index.js';

/**
 * Scoring Engine
 * 
 * Aggregates rule effects and intelligence signals into a final risk score.
 * 
 * Rules are additive. Intelligence signals are bounded and advisory only.
 * If no rules are present, signals have full influence (100%).
 * 
 * Signal weights can be configured via environment variables:
 * - AGENT_FIREWALL_SIGNAL_WEIGHT_WITH_RULES (default: 0.2) - signal weight when rules exist
 * - AGENT_FIREWALL_SIGNAL_WEIGHT_NO_RULES (default: 1.0) - signal weight when no rules exist
 * - AGENT_FIREWALL_SIGNAL_CONFIDENCE_WEIGHT (default: 0.2) - signal contribution to confidence
 */
export class ScoringEngine {
  /**
   * Maximum influence of intelligence signals when rules are present.
   * Configurable via AGENT_FIREWALL_SIGNAL_WEIGHT_WITH_RULES env var.
   * Default: 0.2 (20% max influence when rules exist)
   */
  private readonly maxSignalWeightWithRules: number;

  /**
   * Signal weight when no rules are present.
   * Configurable via AGENT_FIREWALL_SIGNAL_WEIGHT_NO_RULES env var.
   * Default: 1.0 (100% influence when no rules exist)
   */
  private readonly signalWeightNoRules: number;

  /**
   * Signal contribution to confidence calculation.
   * Configurable via AGENT_FIREWALL_SIGNAL_CONFIDENCE_WEIGHT env var.
   * Default: 0.2 (20% contribution to confidence)
   */
  private readonly signalConfidenceWeight: number;

  constructor() {
    // Read signal weights from environment variables with defaults
    this.maxSignalWeightWithRules = this.parseEnvFloat(
      'AGENT_FIREWALL_SIGNAL_WEIGHT_WITH_RULES',
      0.2
    );
    this.signalWeightNoRules = this.parseEnvFloat(
      'AGENT_FIREWALL_SIGNAL_WEIGHT_NO_RULES',
      1.0
    );
    this.signalConfidenceWeight = this.parseEnvFloat(
      'AGENT_FIREWALL_SIGNAL_CONFIDENCE_WEIGHT',
      0.2
    );

    // Validate ranges
    this.validateWeight('maxSignalWeightWithRules', this.maxSignalWeightWithRules, 0, 1);
    this.validateWeight('signalWeightNoRules', this.signalWeightNoRules, 0, 1);
    this.validateWeight('signalConfidenceWeight', this.signalConfidenceWeight, 0, 1);
  }

  /**
   * Parse a float from environment variable with default fallback.
   * Invalid values silently fall back to default.
   */
  private parseEnvFloat(envVar: string, defaultValue: number): number {
    const value = process.env[envVar];
    if (value === undefined) {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      // Invalid value - silently use default
      return defaultValue;
    }
    return parsed;
  }

  /**
   * Validate that a weight is within valid range [0, 1].
   */
  private validateWeight(name: string, value: number, min: number, max: number): void {
    if (value < min || value > max) {
      throw new Error(
        `${name} must be between ${min} and ${max}, got ${value}`
      );
    }
  }

  /**
   * Calculate the final risk score from rule evidence and optional signals.
   * 
   * @param evidence - Rule evaluation results
   * @param signals - Optional intelligence signals (advisory only)
   * @returns Final risk score (0.0-1.0) and confidence (0.0-1.0)
   */
  calculate(
    evidence: RuleEvidence[],
    signals: Signal[] = []
  ): { riskScore: number; confidence: number } {
    // Step 1: Aggregate rule scores (additive)
    const ruleScore = this.aggregateRuleScores(evidence);

    // Step 2: Determine if rules are present
    const hasRules = evidence.length > 0;
    
    // Step 3: Apply intelligence signals (bounded if rules exist, full if no rules)
    const signalAdjustment = this.calculateSignalAdjustment(signals, hasRules);

    // Step 4: Combine scores
    // If no rules, use signal score directly; otherwise add to rule score
    const riskScore = hasRules
      ? Math.min(1.0, ruleScore + signalAdjustment)
      : signalAdjustment;

    // Step 5: Calculate confidence
    const confidence = this.calculateConfidence(evidence, signals, hasRules);

    return {
      riskScore: Math.max(0.0, Math.min(1.0, riskScore)),
      confidence: Math.max(0.0, Math.min(1.0, confidence)),
    };
  }

  /**
   * Aggregate rule scores additively.
   * Each matched rule contributes its score.
   */
  private aggregateRuleScores(evidence: RuleEvidence[]): number {
    let totalScore = 0.0;

    for (const ev of evidence) {
      if (ev.matched && ev.effect) {
        totalScore += ev.effect.score;
      }
    }

    // Cap at 1.0 (rules are additive but bounded)
    return Math.min(1.0, totalScore);
  }

  /**
   * Calculate signal adjustment with dynamic influence.
   * If no rules are present, signals have full influence (100%).
   * If rules are present, signals are bounded to maxSignalWeightWithRules (20%).
   */
  private calculateSignalAdjustment(signals: Signal[], hasRules: boolean): number {
    if (signals.length === 0) {
      return 0.0;
    }

    // Average novelty scores from all signals, weighted by confidence
    let weightedNovelty = 0.0;
    let totalConfidence = 0.0;

    for (const signal of signals) {
      weightedNovelty += signal.noveltyScore * signal.confidence;
      totalConfidence += signal.confidence;
    }

    if (totalConfidence === 0) {
      return 0.0;
    }

    const avgNovelty = weightedNovelty / totalConfidence;

    // Apply dynamic weight: configurable weight based on whether rules exist
    const signalWeight = hasRules ? this.maxSignalWeightWithRules : this.signalWeightNoRules;
    return avgNovelty * signalWeight;
  }

  /**
   * Calculate confidence in the risk score.
   * 
   * Factors:
   * - Number of matched rules (more rules = higher confidence)
   * - Rule severity distribution
   * - Intelligence signal confidence (if available)
   * - If no rules, confidence comes primarily from signals
   */
  private calculateConfidence(
    evidence: RuleEvidence[],
    signals: Signal[],
    hasRules: boolean
  ): number {
    const matchedRules = evidence.filter((ev) => ev.matched);

    if (!hasRules) {
      // No rules present - confidence comes from signals
      if (signals.length === 0) {
        return 0.3; // Low confidence if no rules and no signals
      }
      
      // Use signal confidence directly (weighted average)
      const avgSignalConfidence =
        signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
      return Math.min(1.0, avgSignalConfidence);
    }

    // Rules are present
    if (matchedRules.length === 0) {
      // Rules exist but none matched - low confidence
      let signalConfidence = 0.0;
      if (signals.length > 0) {
        const avgSignalConfidence =
          signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
        signalConfidence = avgSignalConfidence * this.signalConfidenceWeight;
      }
      return Math.min(1.0, 0.3 + signalConfidence);
    }

    // Base confidence from rule count (more rules = higher confidence)
    const ruleConfidence = Math.min(1.0, matchedRules.length * 0.2);

    // Boost from high-severity rules
    const highSeverityCount = matchedRules.filter(
      (ev) => ev.effect?.severity === 'high' || ev.effect?.severity === 'critical'
    ).length;
    const severityBoost = Math.min(0.3, highSeverityCount * 0.1);

    // Intelligence signal confidence (if available)
    let signalConfidence = 0.0;
    if (signals.length > 0) {
      const avgSignalConfidence =
        signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length;
      signalConfidence = avgSignalConfidence * this.signalConfidenceWeight;
    }

    return Math.min(1.0, ruleConfidence + severityBoost + signalConfidence);
  }
}

