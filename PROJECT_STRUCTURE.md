# Project Structure

This document outlines the structure of the @algogi/agent-firewall project.

## Directory Layout

```
agent-firewall/
├── src/                          # Source code
│   ├── adapters/                 # Framework adapters
│   │   ├── langchain.ts          # LangChain.js integration
│   │   └── langgraph.ts          # LangGraph.js integration
│   ├── firewall.ts               # Main firewall orchestrator
│   ├── index.ts                  # Public API exports
│   ├── intelligence/             # Intelligence providers
│   │   ├── algogi-cloud.ts       # Algogi Cloud ML API (opt-in)
│   │   └── byom.ts               # Bring Your Own Model interface
│   ├── interfaces/               # TypeScript interfaces
│   │   ├── intelligence.ts       # IntelligenceProvider interface
│   │   ├── policy.ts             # Policy interface
│   │   └── rule.ts               # Rule interface
│   ├── normalization/            # Input normalization
│   │   └── pipeline.ts           # Normalization pipeline
│   ├── policy/                   # Policy implementations
│   │   └── default.ts            # Default policy
│   ├── rules/                    # Rule engine
│   │   ├── base.ts               # Base rule class
│   │   ├── engine.ts             # Rule engine
│   │   └── examples/             # Example rules
│   │       ├── contextual.ts    # Contextual rules
│   │       ├── encoding.ts       # Encoding rules
│   │       ├── linguistic.ts     # Linguistic rules
│   │       └── structural.ts    # Structural rules
│   ├── schemas/                  # Zod schemas
│   │   └── index.ts              # All schemas
│   ├── scoring/                  # Scoring engine
│   │   └── engine.ts             # Score aggregation
│   └── utils/                    # Utilities
│       └── metadata.ts           # Metadata computation
├── tests/                        # Test suite
│   ├── corpus/                   # Test corpus
│   │   └── adversarial.ts       # Adversarial test cases
│   ├── rules/                    # Rule tests
│   │   └── structural.test.ts   # Structural rule tests
│   ├── firewall.test.ts         # Firewall integration tests
│   └── schemas.test.ts           # Schema validation tests
├── examples/                     # Usage examples
│   ├── basic-usage.ts           # Basic usage example
│   ├── byom-example.ts          # BYOM integration example
│   └── langchain-example.ts     # LangChain integration example
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── .npmignore                   # NPM publish ignore rules
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # MIT License
├── package.json                 # NPM package configuration
├── PROJECT_STRUCTURE.md         # This file
├── README.md                    # Main documentation
├── SECURITY.md                  # Security policy
├── tsconfig.json                # TypeScript configuration
└── vitest.config.ts             # Vitest configuration
```

## Core Components

### Firewall Pipeline

The firewall follows a fixed pipeline order:

1. **Normalization** (`src/normalization/pipeline.ts`)
   - Unicode normalization (NFC)
   - Whitespace standardization
   - Encoding detection
   - Character set extraction

2. **Rules Evaluation** (`src/rules/engine.ts`)
   - Deterministic rule matching
   - Evidence collection
   - Pure function evaluation

3. **Scoring** (`src/scoring/engine.ts`)
   - Additive rule score aggregation
   - Bounded intelligence signal weights
   - Confidence calculation

4. **Intelligence Signals** (optional)
   - BYOM providers (`src/intelligence/byom.ts`)
   - Algogi Cloud API (`src/intelligence/algogi-cloud.ts`)
   - Bounded influence (max 20%)

5. **Policy Evaluation** (`src/policy/default.ts`)
   - Threshold-based actions
   - Confidence-gated blocking
   - User-defined policies

6. **Decision Output** (`src/firewall.ts`)
   - Action recommendation
   - Risk score and confidence
   - Explainable evidence

### Rule Categories

Rules are organized into four categories:

- **Structural**: Pattern-based detection (nesting, instructions)
- **Linguistic**: Language and character analysis
- **Encoding**: Unicode and encoding attacks
- **Contextual**: Persona and system access attempts

### Intelligence Providers

Two types of intelligence providers:

1. **BYOM** (Bring Your Own Model)
   - Local, free, unsupported
   - User-provided model function
   - Signal-only (no decisions)

2. **Algogi Cloud**
   - Paid, opt-in, per-request
   - ML-based threat intelligence
   - Signal-only (no decisions)

## Testing

### Test Corpus

- **Adversarial**: Known attack patterns
- **Benign**: Legitimate prompts
- **Determinism**: Same input → same output

### Test Types

- Unit tests for individual rules
- Integration tests for firewall pipeline
- Schema validation tests
- Determinism tests

## Build Output

The TypeScript compiler outputs to `dist/`:

- `dist/index.js` - Main entry point
- `dist/index.d.ts` - Type definitions
- `dist/**/*.js` - Compiled JavaScript
- `dist/**/*.d.ts` - Type definitions

## Dependencies

### Runtime

- `zod` - Schema validation

### Peer Dependencies (Optional)

- `@langchain/core` - LangChain.js integration
- `langgraph` - LangGraph.js integration

### Development

- `typescript` - TypeScript compiler
- `vitest` - Test framework
- `eslint` - Linting
- `@types/node` - Node.js types

## Versioning

- **SDK Version**: Semantic versioning (0.1.0, 0.2.0, etc.)
- **Rule Versions**: Independent versioning (1.0.0, 1.1.0, etc.)

Rules are versioned separately to track behavioral changes independently of SDK releases.

