import { AgentFirewall } from '../firewall.js';
import type { Context, Decision } from '../schemas/index.js';

// LangChain types (peer dependency - may not be installed)
type BaseMessage = {
  content: string | Array<{ type?: string; text?: string }>;
  constructor: { name: string };
};

type RunnableConfig = Record<string, unknown>;

/**
 * LangChain.js Adapter
 * 
 * Integrates AgentFirewall with LangChain.js message chains.
 */
export class LangChainFirewall {
  private readonly firewall: AgentFirewall;

  constructor(firewall: AgentFirewall) {
    this.firewall = firewall;
  }

  /**
   * Evaluate a LangChain message for injection risk.
   * 
   * @param message - LangChain message object
   * @param config - Optional LangChain runnable config
   * @returns Decision with action and risk score
   */
  async evaluateMessage(
    message: BaseMessage,
    _config?: RunnableConfig
  ): Promise<Decision> {
    const content = this.extractContent(message);
    const context = this.inferContext(message);

    return this.firewall.evaluate(content, context);
  }

  /**
   * Evaluate multiple messages (e.g., conversation history).
   */
  async evaluateMessages(
    messages: BaseMessage[],
    _config?: RunnableConfig
  ): Promise<Decision[]> {
    return Promise.all(
      messages.map((msg) => this.evaluateMessage(msg, _config))
    );
  }

  /**
   * Extract text content from a LangChain message.
   */
  private extractContent(message: BaseMessage): string {
    if (typeof message.content === 'string') {
      return message.content;
    }
    // Handle array content (e.g., multimodal)
    if (Array.isArray(message.content)) {
      return message.content
        .map((part: { type?: string; text?: string } | string) => {
          if (typeof part === 'string') return part;
          if (typeof part === 'object' && part.type === 'text') return part.text ?? '';
          return '';
        })
        .join(' ');
    }
    return String(message.content);
  }

  /**
   * Infer context from LangChain message type.
   */
  private inferContext(message: BaseMessage): Context {
    const messageType = message.constructor.name.toLowerCase();

    let role: Context['role'] = 'user';
    if (messageType.includes('system')) {
      role = 'system';
    } else if (messageType.includes('ai') || messageType.includes('assistant')) {
      role = 'user'; // AI messages are treated as user input for detection
    } else if (messageType.includes('tool')) {
      role = 'tool';
    }

    return {
      role,
      channel: 'input', // Default to input channel
    };
  }
}

