# Branching Strategy

Use a lightweight trunk-based workflow. `main` is the stable branch and should always be releasable. Keep work on short-lived branches and merge through pull requests; this project does not need a permanent `develop` branch.

## Branch names

- `feat/<short-description>` for product features
- `fix/<short-description>` for bug fixes
- `docs/<short-description>` for documentation
- `chore/<short-description>` for maintenance and tooling

Use lowercase words separated by hyphens, for example `feat/job-match-summary`.

## Workflow

1. Start from an up-to-date `main` and create a branch for one focused change.
2. Commit related changes with a conventional prefix such as `feat:`, `fix:`, `docs:`, or `chore:`.
3. Open a pull request into `main`. Explain the change and note relevant checks or screenshots.
4. Before merging, run the applicable project checks:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

5. Merge with squash-and-merge, then delete the short-lived branch.

## Repository settings and releases

When GitHub hosting is configured, protect `main`: require pull requests, require the checks above to pass, and disallow force pushes. Tag production releases from `main` using semantic versions such as `v1.2.0`. Use a short-lived `fix/` branch for urgent production fixes, then merge it through the same pull request flow.