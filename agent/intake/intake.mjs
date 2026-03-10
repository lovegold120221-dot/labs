import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();
const INTAKE_DIR = path.join(PROJECT_ROOT, 'agent/intake');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'agent/output');

async function processIntake(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);

  console.log(`Processing intake: ${fileName}`);

  let resultFile = null;

  if (ext === '.log') {
    // Trigger log-triage skill
    const reportPath = path.join(OUTPUT_DIR, `triage-${Date.now()}.json`);
    try {
      const output = execSync(`node agent/skills/log-triage/log-triage.mjs ${filePath}`).toString();
      fs.writeFileSync(reportPath, output);
      resultFile = reportPath;
    } catch (error) {
      console.error('Error running log-triage skill:', error);
    }
  } else if (ext === '.json') {
    // Assume it's a structured bug report
    const reportPath = path.join(OUTPUT_DIR, `issue-${Date.now()}.json`);
    const reportData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add enrichment
    reportData.intake_at = new Date().toISOString();
    reportData.status = 'TRIAGED';
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    resultFile = reportPath;
  }

  if (resultFile) {
    console.log(`Successfully triaged. Result saved to: ${path.relative(PROJECT_ROOT, resultFile)}`);
  }
}

const args = process.argv.slice(2);
const intakeFile = args[0];

if (intakeFile) {
  processIntake(intakeFile).catch(console.error);
} else {
  console.log('Watching for new files in agent/intake... (placeholder)');
}
