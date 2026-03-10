# Client-Side Assistant Specification

## 1. User-Facing Assistant Widget
A non-intrusive floating widget that provides:
- **Bug Reporting:** Simple form for describing what happened.
- **Feature Requests:** Suggest new functionality or improvements.
- **Support Chat:** Direct interaction with the App Agent (optional).
- **Issue Tracking:** Status updates on reported issues.

## 2. Automated Metadata Collection
For bug reports, the widget will automatically attach:
- **Page URL:** The current page where the error occurred.
- **App Version:** Current version from the build metadata.
- **Environment:** Staging or production.
- **Browser/Device:** Client-side environment details.
- **User Action Trail:** A sequence of recent user interactions.
- **Console Errors:** Recent JavaScript errors and warnings.

## 3. Data Privacy & Consent
- **Consent Notice:** Explicitly inform the user before collecting logs or metadata.
- **Opt-Out:** Allow users to opt-out of automated data collection.
- **PII Redaction:** Ensure no personally identifiable information is sent with metadata.

## 4. Issue Submission Flow
1. **User Trigger:** Click the assistant widget or report button.
2. **Form Input:** Enter description and optional screenshot/video.
3. **Automatic Enrichment:** Gather metadata and logs.
4. **Submission:** Send the report to the intake layer.
5. **Confirmation:** Display a success message and issue tracking ID.
