# Patch Generation and Validation Specification

## 1. Patch Generation Process
- **Surgical Changes:** Minimize the scope of modifications.
- **Idiomatic Code:** Follow the repository's existing patterns.
- **Documentation:** Include clear reasoning for each change.
- **Automated Checks:** Run `lint` and `typecheck` during generation.

## 2. Patch Validation Rules
- **No Regressions:** Verify existing tests pass on the modified code.
- **Unit Testing:** Add new unit tests for any new logic or bug fixes.
- **Integration Testing:** Confirm changes don't break related components.
- **Smoke Testing:** Verify critical user flows in a staging environment.

## 3. Patch Reporting
Each patch will include a report containing:
- **Summary:** Concise description of the changes.
- **Reasoning:** Technical rationale for the implementation.
- **Validation Report:** Results of all automated and manual tests.
- **Affected Files:** A complete list of all modified files.

## 4. Rejection Criteria
Patches will be rejected if they:
- **Increase Error Surface:** Introduce new errors or warnings.
- **Violate Style:** Diverge significantly from existing code patterns.
- **Fail Tests:** Do not pass all required automated or manual tests.
- **Expose Secrets:** Include API keys, secrets, or other sensitive data.
