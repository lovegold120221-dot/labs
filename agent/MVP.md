# App Agent MVP Scope

## 1. Overview
The **App Agent MVP** focuses on providing a functional prototype for bug triage, patch generation, and deployment management.

## 2. Core Features (MVP)
- **GitHub Repo Scan:** Map the repository's structure and configuration.
- **Admin Bug Intake:** A simple dashboard for receiving bug reports and logs.
- **Log Ingestion:** Ingest Next.js and Supabase error logs for triage.
- **Bug Triage:** Categorize and score bugs based on logs and reports.
- **Patch Proposal:** Generate surgical code changes and validation reports.
- **PR Automation:** Open a GitHub Pull Request for approved patches.
- **Staging Deploy:** Trigger a deployment to the staging environment.
- **Deployment Report:** Provide a summary of the deployment outcome.

## 3. Excluded Features (Phase 2)
- **Autonomous Plugin/Component Install:** Automated installation of new libraries.
- **Cross-Repo Dependency Fixes:** Fixing bugs across multiple repositories.
- **Upgrade Orchestration:** Complex library and framework migrations.
- **User Chat Mining:** Identifying UX issues from user chat transcripts.
- **Performance Optimization Skills:** Automated performance tuning.
- **Self-Healing Playbooks:** Automated responses to production incidents.

## 4. Success Criteria for MVP
- **Accuracy:** Correctly identify the root cause of high-severity bugs.
- **Reliability:** Successfully generate and validate patches for simple bugs.
- **Usability:** Provide a functional admin dashboard for task management.
- **Integration:** Successfully open PRs and trigger staging deployments.
