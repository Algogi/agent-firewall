import type { RuleEvidence, Signal } from '../schemas/index.js';

/**
 * Scoring Engine
 * 
 * Aggregates rule effects and intelligence signals into a final risk score.
 * 
 * Rules are additive. Intelligence signals are bounded and advisory only.
 */
export class ScoringEngine {
  /**
   * Maximum influence of intelligence signals on the final score.
   * Signals can adjust confidence but are capped in score impact.
   */
  private readonly maxSignalWeight = 0.2; // 20% max influence

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

    // Step 2: Apply intelligence signals (bounded)
    const signalAdjustment = this.calculateSignalAdjustment(signals);

    // Step 3: Combine with bounded signal influence
    const riskScore = Math.min(1.0, ruleScore + signalAdjustment);

    // Step 4: Calculate confidence
    const confidence = this.calculateConfidence(evidence, signals);

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
   * Calculate signal adjustment with bounded influence.
   * Signals can only adjust the score within the maxSignalWeight limit.
   */
  private calculateSignalAdjustment(signals: Signal[]): number {
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

    // Apply bounded adjustment (signals can only influence up to maxSignalWeight)
    return avgNovelty * this.maxSignalWeight;
  }

  /**
   * Calculate confidence in the risk score.
   * 
   * Factors:
   * - Number of matched rules (more rules = higher confidence)
   * - Rule severity distribution
   * - Intelligence signal confidence (if available)
   */
  private calculateConfidence(
    evidence: RuleEvidence[],
    signals: Signal[]
  ): number {
    const matchedRules = evidence.filter((ev) => ev.matched);

    if (matchedRules.length === 0) {
      // Low confidence if no rules matched
      return 0.3;
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
      signalConfidence = avgSignalConfidence * 0.2; // Signals contribute up to 20%
    }

    return Math.min(1.0, ruleConfidence + severityBoost + signalConfidence);
  }
}

