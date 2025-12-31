import { describe, it, expect } from 'vitest';
import {
  SignalSchema,
  DecisionSchema,
  RuleEvidenceSchema,
  ContextSchema,
  MetadataSchema,
} from '../src/schemas/index.js';

describe('Schema Validation', () => {
  describe('SignalSchema', () => {
    it('should validate valid signal', () => {
      const signal = {
        noveltyScore: 0.5,
        predictedClasses: ['injection'],
        confidence: 0.8,
        modelId: 'test-model',
      };

      expect(() => SignalSchema.parse(signal)).not.toThrow();
    });

    it('should reject invalid novelty score', () => {
      const signal = {
        noveltyScore: 1.5, // > 1.0
        predictedClasses: [],
        confidence: 0.5,
        modelId: 'test',
      };

      expect(() => SignalSchema.parse(signal)).toThrow();
    });
  });

  describe('DecisionSchema', () => {
    it('should validate valid decision', () => {
      const decision = {
        action: 'block',
        riskScore: 0.7,
        confidence: 0.9,
        explanation: 'Test explanation',
        evidence: [],
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      };

      expect(() => DecisionSchema.parse(decision)).not.toThrow();
    });

    it('should reject invalid action', () => {
      const decision = {
        action: 'invalid',
        riskScore: 0.5,
        confidence: 0.5,
        explanation: 'Test',
        evidence: [],
        timestamp: new Date().toISOString(),
        version: '0.1.0',
      };

      expect(() => DecisionSchema.parse(decision)).toThrow();
    });
  });

  describe('ContextSchema', () => {
    it('should validate valid context', () => {
      const context = {
        role: 'user',
        channel: 'input',
      };

      expect(() => ContextSchema.parse(context)).not.toThrow();
    });

    it('should reject invalid role', () => {
      const context = {
        role: 'invalid',
        channel: 'input',
      };

      expect(() => ContextSchema.parse(context)).toThrow();
    });
  });

  describe('MetadataSchema', () => {
    it('should validate valid metadata', () => {
      const metadata = {
        tokenCount: 100,
        entropy: 4.5,
        language: 'en',
      };

      expect(() => MetadataSchema.parse(metadata)).not.toThrow();
    });

    it('should reject negative token count', () => {
      const metadata = {
        tokenCount: -1,
        entropy: 4.5,
      };

      expect(() => MetadataSchema.parse(metadata)).toThrow();
    });
  });
});

