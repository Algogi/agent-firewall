# Security Policy

## Supported Versions

We provide security updates for:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Email security reports to: **security@algogi.com**

### What to Include

1. **Description**: Clear description of the vulnerability
2. **Impact**: Potential security impact
3. **Reproduction**: Steps to reproduce (if applicable)
4. **Fix**: Suggested fix (if you have one)
5. **Disclosure**: Preferred disclosure timeline

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Development**: Depends on severity
- **Public Disclosure**: After fix is available (coordinated)

## Security Guarantees

### What We Guarantee

- **Determinism**: Rules produce consistent results
- **No Silent Failures**: Failures are explicit and logged
- **No Telemetry**: Zero data collection by default
- **Opt-in Only**: All external services require explicit configuration
- **Fail Open**: Intelligence provider failures don't block requests

### What We Don't Guarantee

- **Perfect Detection**: No security system is 100% effective
- **Zero False Positives**: Some legitimate prompts may be flagged
- **Zero False Negatives**: Some attacks may be missed
- **Model Security**: We don't protect against model-level attacks
- **Supply Chain**: We don't protect against dependency vulnerabilities

## Threat Model

### In Scope

- Prompt injection attacks
- Instruction override attempts
- Persona injection
- Encoding-based obfuscation
- Structural anomalies

### Out of Scope

- Model training data poisoning
- Model fine-tuning attacks
- Supply chain attacks on dependencies
- Network-level attacks
- Side-channel attacks
- Physical security

## Security Best Practices

### For Users

1. **Keep Updated**: Regularly update to latest stable version
2. **Review Rules**: Understand what rules are active
3. **Custom Policies**: Define policies appropriate for your use case
4. **Monitor Decisions**: Log and review firewall decisions
5. **Test Regularly**: Use adversarial corpus to test your setup

### For Contributors

1. **No Secrets**: Never commit API keys or secrets
2. **Dependency Updates**: Keep dependencies updated
3. **Security Reviews**: All PRs reviewed for security implications
4. **Rule Testing**: Test rules against adversarial corpus
5. **Documentation**: Document security-relevant behavior

## Known Limitations

### Rule Bypasses

- **Encoding Attacks**: Some Unicode attacks may bypass rules
- **Context-Dependent**: Rules may not understand full context
- **Novel Attacks**: New attack patterns may not be detected

### Performance

- **DoS Risk**: Malicious inputs may cause performance issues
- **Resource Limits**: No built-in rate limiting
- **Memory**: Large inputs may consume significant memory

### Intelligence Providers

- **BYOM Security**: User-provided models are not audited
- **Network Failures**: Algogi Cloud failures fail open
- **Model Updates**: Model versions may change behavior

## Security Updates

Security updates are released as:
- **Patch releases**: For critical vulnerabilities
- **Minor releases**: For important security improvements
- **Major releases**: For breaking security changes

All security updates are documented in CHANGELOG.md.

## Responsible Disclosure

We follow responsible disclosure practices:
1. Report privately to security@algogi.com
2. Allow time for fix development
3. Coordinate public disclosure
4. Credit researchers (if desired)

## Security Audit

This project has not yet undergone a formal security audit. If you're interested in auditing, contact security@algogi.com.

## Contact

- **Security**: security@algogi.com
- **General**: See README.md for support channels

---

**Security is a shared responsibility.**

