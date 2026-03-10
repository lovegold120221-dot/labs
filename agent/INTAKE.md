# Issue Intake and Triage Layer

## 1. Issue Categories
- **Bug:** Unexpected behavior or functional error.
- **Feature:** New functionality or component request.
- **Upgrade:** Dependency update or framework migration.
- **Deployment:** Staging or production rollout task.
- **Incident:** High-severity runtime issue affecting users.

## 2. Severity Scoring (1-5)
- **S1 (Critical):** Application is down, core functionality broken.
- **S2 (High):** Significant impact on a major feature.
- **S3 (Medium):** Moderate impact on a non-critical feature.
- **S4 (Low):** Minor bug or cosmetic issue.
- **S5 (Minimal):** Typo, small UI adjustment, or question.

## 3. Reproduction Scoring
- **R1:** Easily reproducible with clear steps and logs.
- **R2:** Reproducible with some effort or specific environment.
- **R3:** Intermittent or environment-specific (difficult to reproduce).
- **R4:** Unable to reproduce after multiple attempts.

## 4. Business Impact Scoring
- **B1:** Affects all users or critical business metrics.
- **B2:** Affects a subset of users or important business metrics.
- **B3:** Affects a small number of users or minor business metrics.

## 5. Triage Process
1. **Intake:** Ingest issue from GitHub, log, or user report.
2. **Classification:** Assign category, severity, and reproduction scores.
3. **Reproducibility:** Attempt to reproduce the bug in a local environment.
4. **Impact Analysis:** Evaluate the potential consequences of the issue.
5. **Skill Assignment:** Suggest the most relevant skill pack for the task.
6. **Prioritization:** Add the task to the App Agent's queue.
