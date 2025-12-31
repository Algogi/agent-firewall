import type { Policy, PolicyAction, PolicyThreshold } from '../interfaces/policy.js';
import type { PolicyThreshold as PolicyThresholdType } from '../schemas/index.js';

/**
 * Default Policy
 * 
 * Standard policy with configurable thresholds.
 */
export class DefaultPolicy implements Policy {
  readonly id = 'default';
  readonly version = '1.0.0';

  private readonly thresholds: PolicyThresholdType;

  constructor(thresholds?: Partial<PolicyThresholdType>) {
    this.thresholds = {
      warn: thresholds?.warn ?? 0.3,
      block: thresholds?.block ?? 0.7,
      quarantine: thresholds?.quarantine ?? 0.9,
    };
  }

  evaluate(riskScore: number, confidence: number): PolicyAction {
    // Confidence must be above 0.5 to take blocking actions
    if (confidence < 0.5 && riskScore > this.thresholds.warn) {
      return 'warn';
    }

    if (riskScore >= this.thresholds.quarantine) {
      return 'quarantine';
    }

    if (riskScore >= this.thresholds.block) {
      return 'block';
    }

    if (riskScore >= this.thresholds.warn) {
      return 'warn';
    }

    return 'allow';
  }

  getThresholds(): PolicyThreshold {
    return { ...this.thresholds };
  }
}

