import type { Metadata } from '../schemas/index.js';

/**
 * Utility functions for computing metadata.
 */
export class MetadataComputer {
  /**
   * Estimate token count using a simple approximation.
   */
  static estimateTokenCount(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate Shannon entropy of the text.
   */
  static calculateEntropy(text: string): number {
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

  /**
   * Detect language (ISO 639-1) using basic heuristics.
   * MVP: Returns undefined. Future: implement detection.
   */
  static detectLanguage(_text: string): string | undefined {
    // MVP: No language detection
    // Future: Implement basic language detection
    return undefined;
  }

  /**
   * Compute full metadata from text.
   */
  static compute(text: string): Metadata {
    return {
      tokenCount: this.estimateTokenCount(text),
      entropy: this.calculateEntropy(text),
      language: this.detectLanguage(text),
    };
  }
}

