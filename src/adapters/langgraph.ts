import { AgentFirewall } from '../firewall.js';
import type { Decision } from '../schemas/index.js';

/**
 * LangGraph.js Adapter
 * 
 * Integrates AgentFirewall with LangGraph state graphs.
 * Provides nodes and edges for firewall evaluation.
 */
export class LangGraphFirewall {
  private readonly firewall: AgentFirewall;

  constructor(firewall: AgentFirewall) {
    this.firewall = firewall;
  }

  /**
   * Create a firewall evaluation node for LangGraph.
   * 
   * This node evaluates messages in the graph state and adds
   * firewall decisions to the state.
   * 
   * @param stateKey - Key in state where messages are stored
   * @param decisionKey - Key in state where decision will be stored
   */
  createFirewallNode<T extends Record<string, unknown>>(
    stateKey: string,
    decisionKey: string = 'firewallDecision'
  ): (state: T) => Promise<T & { [key: string]: Decision }> {
    return async (state: T) => {
      const messages = (state[stateKey] as { content?: string }[]) ?? [];
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage || !lastMessage.content) {
        return {
          ...state,
          [decisionKey]: {
            action: 'allow',
            riskScore: 0.0,
            confidence: 0.0,
            explanation: 'No message to evaluate',
            evidence: [],
            timestamp: new Date().toISOString(),
            version: '0.1.0',
          } as Decision,
        };
      }

      const decision = await this.firewall.evaluate(
        String(lastMessage.content),
        {
          role: 'user',
          channel: 'input',
        }
      );

      return {
        ...state,
        [decisionKey]: decision,
      };
    };
  }

  /**
   * Create a conditional edge based on firewall decision.
   * 
   * Routes the graph based on the firewall action.
   * 
   * @param decisionKey - Key in state where decision is stored
   */
  createFirewallEdge(decisionKey: string = 'firewallDecision') {
    return (state: Record<string, unknown>): string => {
      const decision = state[decisionKey] as Decision | undefined;

      if (!decision) {
        return 'allow'; // Default route
      }

      return decision.action;
    };
  }
}

