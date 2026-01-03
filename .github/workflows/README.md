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
4. Publish to npm using **trusted publishing (OIDC)** - no tokens required
5. Create GitHub release (if manual dispatch)

**Purpose:** Automated npm publishing with validation using secure OIDC authentication.

**Authentication:** This workflow uses npm's trusted publishing feature, which uses OIDC (OpenID Connect) tokens instead of long-lived npm tokens. This is more secure as it uses short-lived, workflow-specific credentials.

## Required Configuration

### For Releases - Trusted Publishing Setup

This project uses **npm trusted publishing** with OIDC, which is more secure than traditional tokens. No GitHub secrets are required for publishing.

**To set up trusted publishing:**

1. **Configure on npmjs.com:**
   - Go to your package page on npmjs.com (e.g., `https://www.npmjs.com/package/@algogi/agent-firewall`)
   - Navigate to **Settings** → **Trusted Publishers**
   - Click **Add Trusted Publisher**
   - Select **GitHub Actions** as the provider
   - Configure the following:
     - **Repository:** `Algogi/agent-firewall` (or your repository name)
     - **Workflow file:** `release.yml` (must match exactly, including `.yml` extension)
     - **Environment name:** (optional, leave blank unless using GitHub environments)
   - Click **Save**

2. **Workflow Configuration:**
   - The workflow already has `id-token: write` permission (required for OIDC)
   - The workflow uses `setup-node@v4` with `registry-url: 'https://registry.npmjs.org'`
   - No `NODE_AUTH_TOKEN` or secrets are needed

**Benefits of Trusted Publishing:**
- ✅ More secure: Uses short-lived, workflow-specific credentials
- ✅ Automatic provenance generation for public packages
- ✅ No token management: No need to store or rotate long-lived tokens
- ✅ Eliminates risk of token exposure in logs or configuration files

**Note:** If you need to install private npm dependencies during the build, you may still need a read-only token for `npm ci`. However, publishing uses OIDC and requires no tokens.

For more information, see: [npm Trusted Publishing Documentation](https://docs.npmjs.com/trusted-publishers)

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

1. **Trusted Publisher Configuration:**
   - Verify trusted publisher is configured on npmjs.com (Settings → Trusted Publishers)
   - Ensure repository name matches exactly (case-sensitive)
   - Ensure workflow filename matches exactly: `release.yml` (including `.yml` extension)
   - Verify you're using GitHub-hosted runners (self-hosted runners are not supported)

2. **Workflow Permissions:**
   - Verify `id-token: write` permission is set in the workflow (already configured)
   - Ensure `registry-url: 'https://registry.npmjs.org'` is set in setup-node step

3. **Version Verification:**
   - Check version matches package.json
   - Ensure semantic versioning is followed

4. **Authentication Errors:**
   - If you see `ENEEDAUTH` errors, verify trusted publisher configuration on npmjs.com
   - Double-check that repository name and workflow filename match exactly
   - Ensure the workflow file exists in `.github/workflows/` directory

5. **For Private Dependencies:**
   - If `npm ci` fails with authentication errors for private packages, you may need a read-only token
   - Add `NODE_AUTH_TOKEN: ${{ secrets.NPM_READ_TOKEN }}` to the `npm ci` step only (not for publish)

