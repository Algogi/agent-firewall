import { NormalizationPipeline } from './normalization/pipeline.js';
import { RuleEngine } from './rules/engine.js';
import { ScoringEngine } from './scoring/engine.js';
import type { Policy } from './interfaces/policy.js';
import type { IntelligenceProvider } from './interfaces/intelligence.js';
import type {
  Context,
  Metadata,
  Decision,
  RuleEvidence,
  Signal,
} from './schemas/index.js';

/**
 * Agent Firewall
 * 
 * Main orchestrator for the prompt injection detection pipeline.
 * 
 * Pipeline order (fixed):
 * 1. Input normalization
 * 2. Deterministic rules evaluation
 * 3. Scoring aggregation
 * 4. Optional intelligence signals
 * 5. Policy evaluation
 * 6. Decision + explanation
 */
export class AgentFirewall {
  private readonly normalizer: NormalizationPipeline;
  private readonly ruleEngine: RuleEngine;
  private readonly scoringEngine: ScoringEngine;
  private readonly policy: Policy;
  private readonly intelligenceProviders: IntelligenceProvider[];
  private readonly version: string;

  constructor(config: {
    rules?: RuleEngine;
    policy: Policy;
    intelligenceProviders?: IntelligenceProvider[];
    version?: string;
  }) {
    this.normalizer = new NormalizationPipeline();
    this.ruleEngine = config.rules ?? new RuleEngine();
    this.scoringEngine = new ScoringEngine();
    this.policy = config.policy;
    this.intelligenceProviders = config.intelligenceProviders ?? [];
    this.version = config.version ?? '0.2.0';
  }

  /**
   * Evaluate a prompt for injection risk.
   * 
   * @param prompt - The input prompt text
   * @param context - Request context (role, channel, etc.)
   * @param metadata - Optional pre-computed metadata
   * @returns Decision with action, risk score, and explanation
   */
  async evaluate(
    prompt: string,
    context: Context,
    metadata?: Partial<Metadata>
  ): Promise<Decision> {
    // Step 1: Normalize input
    const normalizedInput = this.normalizer.normalize(prompt);

    // Step 2: Evaluate deterministic rules
    const evidence = this.ruleEngine.evaluate(normalizedInput);

    // Step 3: Gather intelligence signals (optional, parallel)
    const signals = await this.gatherIntelligenceSignals(
      normalizedInput,
      context,
      metadata ?? {}
    );

    // Step 5: Calculate final score with signals
    const { riskScore, confidence } = this.scoringEngine.calculate(
      evidence,
      signals
    );

    // Step 6: Evaluate policy
    const action = this.policy.evaluate(riskScore, confidence);

    // Step 7: Generate explanation
    const explanation = this.generateExplanation(
      evidence,
      signals,
      riskScore,
      confidence,
      action
    );

    return {
      action,
      riskScore,
      confidence,
      explanation,
      evidence,
      signals: signals.length > 0 ? signals : undefined,
      timestamp: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Gather intelligence signals from all enabled providers.
   */
  private async gatherIntelligenceSignals(
    normalizedInput: ReturnType<NormalizationPipeline['normalize']>,
    context: Context,
    metadata: Partial<Metadata>
  ): Promise<Signal[]> {
    const enabledProviders = this.intelligenceProviders.filter(
      (p) => p.enabled
    );

    if (enabledProviders.length === 0) {
      return [];
    }

    // Compute metadata if not provided
    const fullMetadata: Metadata = {
      tokenCount: metadata.tokenCount ?? this.estimateTokenCount(normalizedInput.normalized),
      entropy: metadata.entropy ?? this.calculateEntropy(normalizedInput.normalized),
      language: metadata.language,
    };

    // Gather signals in parallel (failures are ignored)
    const signalPromises = enabledProviders.map(async (provider) => {
      try {
        return await provider.analyze(normalizedInput, context, fullMetadata);
      } catch (error) {
        // Fail open: return neutral signal on error
        return {
          noveltyScore: 0.0,
          predictedClasses: [],
          confidence: 0.0,
          modelId: provider.id,
        } as Signal;
      }
    });

    return Promise.all(signalPromises);
  }

  /**
   * Generate human-readable explanation of the decision.
   */
  private generateExplanation(
    evidence: RuleEvidence[],
    signals: Signal[],
    riskScore: number,
    confidence: number,
    action: Decision['action']
  ): string {
    const matchedRules = evidence.filter((ev) => ev.matched);
    const parts: string[] = [];

    parts.push(`Risk score: ${(riskScore * 100).toFixed(1)}%`);
    parts.push(`Confidence: ${(confidence * 100).toFixed(1)}%`);
    parts.push(`Action: ${action}`);

    if (matchedRules.length > 0) {
      parts.push(`\nMatched ${matchedRules.length} rule(s):`);
      for (const ev of matchedRules) {
        if (ev.explanation) {
          parts.push(`  - ${ev.explanation}`);
        }
      }
    }

    if (signals.length > 0) {
      parts.push(`\nIntelligence signals: ${signals.length}`);
      for (const signal of signals) {
        parts.push(
          `  - ${signal.modelId}: novelty=${(signal.noveltyScore * 100).toFixed(1)}%, confidence=${(signal.confidence * 100).toFixed(1)}%`
        );
      }
    }

    return parts.join('\n');
  }

  /**
   * Estimate token count (simple approximation).
   */
  private estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate Shannon entropy of the text.
   */
  private calculateEntropy(text: string): number {
    if (text.length === 0) return 0;

    const frequencies = new Map<string, number>();
    for (const char of text) {
      frequencies.set(char, (frequencies.get(char) ?? 0) + 1);
    }

    let entropy = 0;
    for (const count of frequencies.values()) {
      const probability = count / text.length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }
}

