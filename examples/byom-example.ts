/**
 * BYOM (Bring Your Own Model) Example
 * 
 * Demonstrates how to integrate your own local ML model with the firewall.
 */

import {
  AgentFirewall,
  DefaultPolicy,
  RuleEngine,
  InstructionOverrideRule,
  BYOMProvider,
} from '../src/index.js';
import type { Signal, Context, Metadata } from '../src/schemas/index.js';

/**
 * Example: Simple local model that uses heuristics
 */
async function myLocalModel(
  prompt: string,
  context: Context,
  metadata: Metadata
): Promise<Signal> {
  // Your model logic here
  // This is just an example using simple heuristics

  let noveltyScore = 0.0;
  const predictedClasses: string[] = [];

  // Example: High entropy might indicate obfuscation
  if (metadata.entropy > 5.0) {
    noveltyScore += 0.3;
    predictedClasses.push('high-entropy');
  }

  // Example: Long prompts might be suspicious
  if (metadata.tokenCount > 1000) {
    noveltyScore += 0.2;
    predictedClasses.push('unusually-long');
  }

  // Example: Check for suspicious keywords
  const suspiciousKeywords = ['bypass', 'hack', 'exploit'];
  if (suspiciousKeywords.some((keyword) => prompt.toLowerCase().includes(keyword))) {
    noveltyScore += 0.4;
    predictedClasses.push('suspicious-keywords');
  }

  return {
    noveltyScore: Math.min(1.0, noveltyScore),
    predictedClasses,
    confidence: 0.7, // Your model's confidence
    modelId: 'my-local-model',
  };
}

async function main() {
  // Create rules
  const rules = new RuleEngine();
  rules.addRule(new InstructionOverrideRule());

  // Create policy
  const policy = new DefaultPolicy();

  // Create BYOM provider
  const myModel = new BYOMProvider('my-local-model', myLocalModel, true);

  // Create firewall with BYOM
  const firewall = new AgentFirewall({
    rules,
    policy,
    intelligenceProviders: [myModel],
  });

  // Test
  const decision = await firewall.evaluate(
    'This is a very long prompt with high entropy and suspicious keywords like bypass and hack',
    {
      role: 'user',
      channel: 'input',
    }
  );

  console.log('Decision:', decision.action);
  console.log('Risk Score:', decision.riskScore);
  console.log('Signals:', decision.signals);
  console.log('Explanation:', decision.explanation);
}

main().catch(console.error);

