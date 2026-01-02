# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

