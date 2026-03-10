# GitHub Integration Specification

## 1. Access Model
The App Agent is granted read/write access to the **ubiquitous-waffle** repository. This include:
- Reading code, configuration, and documentation.
- Creating and deleting branches.
- Committing and pushing code changes.
- Opening and updating Pull Requests.
- Adding comments and labels to issues and PRs.

## 2. Branch Policy
- **Feature Branches:** `feat/feature-name`
- **Bug Fix Branches:** `fix/issue-id-bug-name`
- **Upgrade Branches:** `upg/dependency-name-vX.Y.Z`
- **Deployment Branches:** `deploy/staging-vX.Y.Z`

## 3. Commit Message Policy
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add new voice cloning service`
- `fix: resolve API route timeout for stt`
- `chore: update next.js to v16.1.6`
- `docs: update app architecture guide`

## 4. Pull Request Workflow
1. **Branch Creation:** Create a dedicated branch for the task.
2. **Implementation:** Push changes to the branch.
3. **Self-Check:** Run `lint`, `typecheck`, and `test` before opening the PR.
4. **PR Generation:** Open a Pull Request with a clear summary and reasoning.
5. **Status Checks:** Monitor status checks (CI/CD) on the PR.
6. **Approval:** Request a human reviewer to approve the PR.
7. **Merge:** Merge the PR to the target branch (e.g., `main`).

## 5. Protected-Branch Safeguards
- **No Direct Push:** Direct pushes to `main` or `production` are strictly prohibited.
- **Rollback Tags:** Create a `rollback-vX.Y.Z` tag before merging high-risk PRs.
- **Review Requirements:** All PRs to protected branches must be approved by at least one human.
