# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-01-03

### Added

- Optional logger interface for receiving warnings:
  - `Logger` interface with `warn(message: string)` method
  - Optional `logger` parameter in `AgentFirewall` constructor
  - Warnings for invalid environment variable values when logger is provided
  - Logger documentation in README with usage examples

### Changed

- `ScoringEngine` constructor now accepts optional `logger` parameter
- Invalid environment variable values now log warnings via logger (if provided)
- Default behavior remains silent when no logger is provided (backward compatible)

## [0.2.0] - 2025-01-03

### Added

- Environment variable configuration for signal weights:
  - `AGENT_FIREWALL_SIGNAL_WEIGHT_WITH_RULES` - Signal weight when rules are present (default: 0.2)
  - `AGENT_FIREWALL_SIGNAL_WEIGHT_NO_RULES` - Signal weight when no rules exist (default: 1.0)
  - `AGENT_FIREWALL_SIGNAL_CONFIDENCE_WEIGHT` - Signal contribution to confidence (default: 0.2)
- Dynamic signal weight behavior: signals have full influence (100%) when no local rules are present
- Validation for environment variable values (must be between 0.0 and 1.0)
- Environment variable documentation in README

### Changed

- Scoring engine now uses configurable signal weights based on environment variables
- Signal weights default to dynamic behavior (20% with rules, 100% without rules) for backward compatibility

## [0.1.0] - 2025-12-31

### Added

- Initial release
- Deterministic rule engine with example rules:
  - Structural rules (excessive nesting, instruction override)
  - Linguistic rules (language switching, special character density)
  - Encoding rules (homoglyphs, mixed encoding)
  - Contextual rules (persona injection, system access)
- Normalization pipeline (Unicode, whitespace, encoding)
- Scoring engine with bounded intelligence signal weights
- Policy evaluation system with configurable thresholds
- Intelligence provider interfaces:
  - BYOM (Bring Your Own Model) - local, free
  - Algogi Cloud ML API - paid, opt-in
- LangChain.js adapter
- LangGraph.js adapter
- Comprehensive test suite with adversarial corpus
- Full documentation (README, CONTRIBUTING, SECURITY)

### Security

- All rules are deterministic and inspectable
- No telemetry or data collection by default
- Fail-open behavior for intelligence provider failures
- Explicit opt-in required for external services

