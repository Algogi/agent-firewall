import { z } from 'zod';

/**
 * Intelligence Signal Schema
 * 
 * Signals from ML models or external intelligence providers.
 * These are advisory only and never override deterministic rules.
 */
export const SignalSchema = z.object({
  noveltyScore: z.number().min(0).max(1),
  predictedClasses: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  modelId: z.string(),
});

export type Signal = z.infer<typeof SignalSchema>;

/**
 * Request Context Schema
 * 
 * Metadata about the prompt's origin and agent configuration.
 */
export const ContextSchema = z.object({
  role: z.enum(['system', 'user', 'tool']),
  channel: z.enum(['input', 'memory', 'instruction']),
  agentType: z.string().optional(),
  toolAccess: z.array(z.string()).optional(),
});

export type Context = z.infer<typeof ContextSchema>;

/**
 * Request Metadata Schema
 * 
 * Computed properties of the input for intelligence providers.
 */
export const MetadataSchema = z.object({
  tokenCount: z.number().int().nonnegative(),
  entropy: z.number().nonnegative(),
  language: z.string().length(2).optional(), // ISO 639-1
});

export type Metadata = z.infer<typeof MetadataSchema>;

/**
 * Intelligence Provider Request Schema
 */
export const IntelligenceRequestSchema = z.object({
  prompt: z.string(),
  context: ContextSchema,
  metadata: MetadataSchema,
});

export type IntelligenceRequest = z.infer<typeof IntelligenceRequestSchema>;

/**
 * Rule Effect Schema
 * 
 * The impact of a rule match on the risk score.
 */
export const RuleEffectSchema = z.object({
  score: z.number(),
  class: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export type RuleEffect = z.infer<typeof RuleEffectSchema>;

/**
 * Rule Evidence Schema
 * 
 * What a rule matched and why.
 */
export const RuleEvidenceSchema = z.object({
  ruleId: z.string(),
  matched: z.boolean(),
  effect: RuleEffectSchema.optional(),
  explanation: z.string().optional(),
});

export type RuleEvidence = z.infer<typeof RuleEvidenceSchema>;

/**
 * Normalized Input Schema
 * 
 * The standardized representation after normalization.
 */
export const NormalizedInputSchema = z.object({
  original: z.string(),
  normalized: z.string(),
  encoding: z.string(),
  length: z.number().int().nonnegative(),
  characterSet: z.array(z.string()),
});

export type NormalizedInput = z.infer<typeof NormalizedInputSchema>;

/**
 * Policy Action Schema
 * 
 * What action to take based on the risk score.
 */
export const PolicyActionSchema = z.enum(['allow', 'warn', 'block', 'quarantine']);

export type PolicyAction = z.infer<typeof PolicyActionSchema>;

/**
 * Policy Threshold Schema
 * 
 * Risk score thresholds for policy actions.
 */
export const PolicyThresholdSchema = z.object({
  warn: z.number().min(0).max(1).default(0.3),
  block: z.number().min(0).max(1).default(0.7),
  quarantine: z.number().min(0).max(1).default(0.9),
});

export type PolicyThreshold = z.infer<typeof PolicyThresholdSchema>;

/**
 * Final Decision Schema
 * 
 * The output of the firewall evaluation.
 */
export const DecisionSchema = z.object({
  action: PolicyActionSchema,
  riskScore: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  evidence: z.array(RuleEvidenceSchema),
  signals: z.array(SignalSchema).optional(),
  timestamp: z.string(),
  version: z.string(),
});

export type Decision = z.infer<typeof DecisionSchema>;

