# GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration, security scanning, and releases.

## Workflows

### CI (`ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
1. **Test Matrix** - Runs on Node.js 18.x, 20.x, and 22.x:
   - Type checking (`npm run typecheck`)
   - Linting (`npm run lint`)
   - Building (`npm run build`)
   - Running tests (`npm test`)
   - Running determinism tests (`npm run test:determinism`)
   - Verifying build output exists

2. **Build Verification** - Single job to verify:
   - Build completes successfully
   - Exports are valid

**Purpose:** Ensures code quality and compatibility across Node.js versions.

### Security (`security.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Mondays at 00:00 UTC)

**Jobs:**
1. **Dependency Scan** - Runs `npm audit` to detect vulnerable dependencies
2. **Code Scan** - Uses GitHub CodeQL to analyze code for security issues

**Purpose:** Maintains security posture through automated vulnerability detection.

### Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests to `main` branch

**Actions:**
- Reviews dependency changes in PRs
- Fails on moderate or higher severity vulnerabilities
- Blocks GPL-2.0 and GPL-3.0 licenses

**Purpose:** Prevents introducing vulnerable or incompatible dependencies.

### Release (`release.yml`)

**Triggers:**
- GitHub releases (published)
- Manual workflow dispatch

**Steps:**
1. Type check and lint
2. Build and test
3. Verify version matches tag
4. Publish to npm (requires `NPM_TOKEN` secret)
5. Create GitHub release (if manual dispatch)

**Purpose:** Automated npm publishing with validation.

## Required Secrets

### For Releases

- `NPM_TOKEN` - npm authentication token with publish permissions
  - **Must be configured in GitHub repository settings** (Settings → Secrets and variables → Actions)
  - Generate at: https://www.npmjs.com/settings/[username]/tokens
  - Required scope: `publish`
  - The token is used by `setup-node@v4` to authenticate with npm during the release workflow

## Workflow Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/Algogi/agent-firewall/workflows/CI/badge.svg)
![Security](https://github.com/Algogi/agent-firewall/workflows/Security/badge.svg)
```

## Dependabot

Dependabot is configured to:
- Check for updates weekly (Mondays)
- Open PRs for dependency updates
- Group minor and patch updates
- Label PRs appropriately

Configuration: `.github/dependabot.yml`

## Best Practices

1. **Never skip CI** - All PRs must pass CI before merging
2. **Review security alerts** - Address dependency vulnerabilities promptly
3. **Test locally first** - Run `npm test` and `npm run lint` before pushing
4. **Version tags** - Use semantic versioning (e.g., `v0.1.0`) for releases

## Troubleshooting

### CI Fails

1. Check which job failed
2. Review the error logs
3. Run the failing command locally
4. Fix the issue and push again

### Security Scan Fails

1. Review the vulnerability report
2. Update vulnerable dependencies
3. If false positive, document in PR

### Release Fails

1. Verify `NPM_TOKEN` secret is configured in GitHub repository settings (Settings → Secrets and variables → Actions)
2. Ensure the token has `publish` scope permissions on npm
3. Check version matches package.json
4. If you see `ENEEDAUTH` errors, verify the token is correctly set and has the required permissions

