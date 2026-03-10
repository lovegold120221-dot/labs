import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

// Error Patterns based on Eburon Standard
const ERROR_PATTERNS = [
  { code: 'EBRN_KEY_MISSING', regex: /api key missing/i, status: 401 },
  { code: 'EBRN_KEY_INVALID', regex: /invalid key/i, status: 401 },
  { code: 'EBRN_ALIAS_UNKNOWN', regex: /unknown model|alias unknown/i, status: 400 },
  { code: 'EBRN_WL_DENY', regex: /not allowed|blocked by whitelist/i, status: 403 },
  { code: 'EBRN_RATE_LIMIT', regex: /rate limited|too many requests/i, status: 429 },
  { code: 'EBRN_UPSTREAM_5XX', regex: /provider error|upstream unavailable/i, status: 502 },
  { code: 'EBU.TOKENS.CONTEXT_LIMIT', regex: /input_token_estimate exceeds max_input_tokens/i, status: 400 }
];

async function triageLogs(logFilePath) {
  if (!fs.existsSync(logFilePath)) {
    throw new Error(`Log file not found: ${logFilePath}`);
  }

  const logs = fs.readFileSync(logFilePath, 'utf8').split('\n');
  const report = {
    analyzed_at: new Date().toISOString(),
    log_source: path.relative(PROJECT_ROOT, logFilePath),
    total_lines: logs.length,
    incidents: [],
    summary: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  };

  logs.forEach((line, index) => {
    if (!line.trim()) return;

    let incident = null;

    // Check against patterns
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.regex.test(line)) {
        incident = {
          line_number: index + 1,
          timestamp: extractTimestamp(line),
          code: pattern.code,
          message: line.trim(),
          severity: mapSeverity(pattern.code),
          route: extractRoute(line),
          status: pattern.status
        };
        break;
      }
    }

    // Generic error fallback
    if (!incident && (line.includes('ERROR') || line.includes('error') || line.includes('Exception'))) {
      incident = {
        line_number: index + 1,
        timestamp: extractTimestamp(line),
        code: 'EBRN_INTERNAL',
        message: line.trim(),
        severity: 'S2', // High
        route: extractRoute(line),
        status: 500
      };
    }

    if (incident) {
      report.incidents.push(incident);
      updateSummary(report.summary, incident.severity);
    }
  });

  console.log(JSON.stringify(report, null, 2));
}

function extractTimestamp(line) {
  const tsMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  return tsMatch ? tsMatch[0] : new Date().toISOString();
}

function extractRoute(line) {
  const routeMatch = line.match(/\/(api\/[^\s?]+)/);
  return routeMatch ? routeMatch[1] : 'unknown';
}

function mapSeverity(code) {
  if (code.startsWith('EBRN_UPSTREAM') || code === 'EBRN_INTERNAL') return 'S1'; // Critical
  if (code === 'EBRN_WL_DENY' || code === 'EBRN_RATE_LIMIT') return 'S2'; // High
  return 'S3'; // Medium
}

function updateSummary(summary, severity) {
  if (severity === 'S1') summary.critical++;
  else if (severity === 'S2') summary.high++;
  else if (severity === 'S3') summary.medium++;
  else summary.low++;
}

const args = process.argv.slice(2);
const logFile = args[0] || 'logs/server.log';

triageLogs(logFile).catch(console.error);
