# App Agent Runtime Pipeline

## 1. Intake
- **Source:** Issue, log, user chat, or admin request.
- **Classification:** Categorize task as `bug`, `feature`, `upgrade`, or `deployment`.
- **Severity Scoring:** Assess impact and urgency.

## 2. Research & Inspection
- **Codebase Scan:** Locate relevant files, components, and services.
- **Dependency Graph:** Understand architectural impact of changes.
- **Context Retrieval:** Fetch related docs, past fixes, and patterns.

## 3. Strategy & Planning
- **Skill Selection:** Choose appropriate skill packs (e.g., `bug-fix`, `feature-add`).
- **Plan Generation:** Produce a detailed implementation strategy.
- **Confidence Scoring:** Evaluate the plan's feasibility before writing code.

## 4. Execution (Patching)
- **Code Modification:** Apply surgical patches following workspace conventions.
- **Automated Verification:** Run `lint`, `typecheck`, and relevant unit tests.
- **Iterative Refinement:** Fix any failures in the execution phase.

## 5. Validation
- **Staging Deployment:** Push changes to a preview/staging environment.
- **Smoke Testing:** Verify critical user flows and health endpoints.
- **Rollback Path:** Prepare for immediate reversal if validation fails.

## 6. Reporting & Delivery
- **PR Creation:** Open a Pull Request with a clear summary and reasoning.
- **Status Reporting:** Update the admin dashboard with the task's outcome.
- **Learning Loop:** Record the fix pattern and feedback for future use.

## Modes of Operation
- **Advisory Mode:** Provide research and plans without modifying code.
- **Patch Mode:** Implement specific changes on a dedicated branch.
- **Autonomous Fix Mode:** Automatically triage and resolve high-confidence bugs.
- **Deployment Mode:** Manage staging-to-production rollouts.
