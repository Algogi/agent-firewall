import type { NormalizedInput } from '../schemas/index.js';

/**
 * Normalization Pipeline
 * 
 * Standardizes input text for deterministic rule evaluation.
 * All rules operate on normalized input only.
 */
export class NormalizationPipeline {
  /**
   * Normalize input text.
   * 
   * Steps:
   * 1. Unicode normalization (NFC)
   * 2. Whitespace normalization
   * 3. Encoding detection and standardization
   * 4. Character set extraction
   */
  normalize(input: string): NormalizedInput {
    // Step 1: Unicode normalization (NFC)
    const nfc = input.normalize('NFC');

    // Step 2: Whitespace normalization
    // Replace all whitespace sequences with single spaces
    // Preserve intentional line breaks for structural analysis
    const whitespaceNormalized = nfc
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .trim();

    // Step 3: Encoding detection
    // For MVP, we assume UTF-8. Future: detect and normalize encodings.
    const encoding = this.detectEncoding(whitespaceNormalized);

    // Step 4: Character set extraction
    const characterSet = this.extractCharacterSet(whitespaceNormalized);

    return {
      original: input,
      normalized: whitespaceNormalized,
      encoding,
      length: whitespaceNormalized.length,
      characterSet,
    };
  }

  /**
   * Detect encoding of the input.
   * MVP: Always returns UTF-8. Future: implement detection.
   */
  private detectEncoding(_text: string): string {
    // Check for common encoding indicators
    // For MVP, assume UTF-8
    return 'utf-8';
  }

  /**
   * Extract unique character set from text.
   */
  private extractCharacterSet(text: string): string[] {
    const chars = new Set<string>();
    for (const char of text) {
      chars.add(char);
    }
    return Array.from(chars).sort();
  }
}

