# Contributing to @algogi/agent-firewall

Thank you for your interest in contributing! This document outlines our contribution guidelines.

## Philosophy

This project prioritizes:
- **Determinism**: All rules must be pure, inspectable functions
- **Trust**: No hidden behavior, no silent changes
- **Explainability**: Every decision must be explainable
- **Offline-first**: Default behavior requires no external dependencies

## Development Setup

```bash
# Clone the repository
git clone https://github.com/algogi/agent-firewall.git
cd agent-firewall

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run determinism tests
npm run test:determinism

# Type check
npm run typecheck

# Lint
npm run lint
```

## Code Standards

### TypeScript

- Strict mode enabled
- All functions must have explicit return types
- No `any` types (use `unknown` if needed)
- Prefer interfaces over type aliases for public APIs

### Rules

Rules must:
- Extend `BaseRule`
- Be pure functions (no side effects)
- Operate only on normalized input
- Never call models or external APIs
- Never depend on other rules
- Include clear descriptions and explanations

Example:

```typescript
export class MyRule extends BaseRule {
  readonly id = 'category.my-rule';
  readonly description = 'Clear description of what this detects';
  readonly version = '1.0.0';
  readonly category = 'structural' as const;

  protected condition(normalizedInput: NormalizedInput): boolean {
    // Pure, deterministic logic only
    return someCondition(normalizedInput.normalized);
  }

  getEffect(): RuleEffect {
    return {
      score: 0.2,
      class: 'my-class',
      severity: 'medium',
    };
  }
}
```

### Tests

All contributions must include tests:
- Unit tests for new rules
- Determinism tests (same input → same output)
- Schema validation tests
- Performance budget tests

## Pull Request Process

1. **Fork and branch**: Create a feature branch from `main`
2. **Write tests**: Include tests for all new functionality
3. **Update docs**: Update README.md if needed
4. **Run checks**: Ensure all tests pass and linting is clean
5. **Submit PR**: Include a clear description of changes

### PR Requirements

- ✅ All tests pass
- ✅ No linting errors
- ✅ TypeScript compiles without errors
- ✅ Determinism tests pass
- ✅ Documentation updated (if needed)
- ✅ CHANGELOG.md updated (if user-facing)

### PR Review Criteria

We review for:
- **Correctness**: Does it work as intended?
- **Determinism**: Is the logic deterministic?
- **Explainability**: Can users understand the decision?
- **Performance**: Does it meet performance budgets?
- **Security**: Does it introduce vulnerabilities?

## Rule Contributions

### Adding New Rules

1. Create rule in appropriate category directory:
   - `src/rules/examples/structural.ts`
   - `src/rules/examples/linguistic.ts`
   - `src/rules/examples/encoding.ts`
   - `src/rules/examples/contextual.ts`

2. Follow naming convention: `CategoryRuleNameRule`

3. Include:
   - Clear description
   - Version number (start at 1.0.0)
   - Appropriate category
   - Deterministic condition logic
   - Effect with score, class, and severity
   - Explanation method

4. Add tests in `tests/rules/`

5. Add to adversarial corpus if applicable

### Rule Versioning

- **MAJOR**: Breaking behavior change
- **MINOR**: New detection patterns (backward compatible)
- **PATCH**: Bug fixes, threshold adjustments

Rule versions are independent of SDK versions.

## Test Contributions

### Adversarial Corpus

Add new test cases to `tests/corpus/adversarial/`:
- Include description of the attack
- Expected rule matches
- Expected risk score range
- Expected action

### Determinism Tests

All rules must pass determinism tests:
- Same input → same output (always)
- No randomness
- No external dependencies

## Documentation

### README Updates

Update README.md if:
- Adding new features
- Changing default behavior
- Adding new configuration options

### Code Comments

- Document all public APIs
- Explain complex logic
- Include examples for non-obvious usage

## Security

### Reporting Vulnerabilities

**Do not** open public issues for security vulnerabilities.

Email: security@algogi.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Review

All PRs are reviewed for security implications:
- Rule bypasses
- Performance DoS
- Information leakage
- Supply chain risks

## Questions?

- Open a [GitHub Discussion](https://github.com/algogi/agent-firewall/discussions)
- Check existing issues and PRs
- Review the codebase

Thank you for contributing! 🎉

