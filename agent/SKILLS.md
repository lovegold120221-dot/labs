# App Agent Skill System

## 1. Overview
The Skill System provides modular capabilities for the App Agent. Each skill is a self-contained package defining its inputs, outputs, and execution logic.

## 2. Skill Manifest Format (`skill.json`)
```json
{
  "id": "skill-id",
  "name": "Skill Name",
  "category": "bug-fix | feature | quality | deployment",
  "inputs": ["required-input-1", "optional-input-2"],
  "outputs": ["patch-diff", "test-report"],
  "priority": 100,
  "execution_rules": {
    "command": "npm run ...",
    "timeout": 300
  }
}
```

## 3. Initial Skill Packs

### Core Repo Skills
- **repo-scan:** Maps the repository's directory structure and files.
- **arch-detection:** Identifies the project's framework, libraries, and patterns.
- **config-audit:** Validates configuration files and environment variables.

### Bug-Fixing Skills
- **runtime-error-triage:** Analyzes logs to identify the root cause of an error.
- **frontend-bug-fix:** Handles UI bugs and state management issues.
- **backend-bug-fix:** Resolves API route errors and server-side logic issues.

### Feature Skills
- **component-creation:** Scaffolds new React components following local styles.
- **api-endpoint-add:** Implements new Next.js API routes with validation.
- **db-migration-add:** Generates Supabase migration files for schema changes.

### Quality Skills
- **lint-fix:** Automatically resolves ESLint errors.
- **test-generation:** Creates new unit tests for components and functions.
- **type-fix:** Fixes TypeScript errors and improves type safety.

### Deployment Skills
- **staging-deploy:** Triggers a deployment to the staging environment.
- **smoke-test:** Runs a suite of critical user flows to verify the deployment.
- **rollback:** Reverts to the last known stable version.

## 4. Priority & Routing Logic
Skills are routed based on task classification and severity. Higher priority skills are executed first (e.g., `runtime-error-triage` for high-severity bugs).
