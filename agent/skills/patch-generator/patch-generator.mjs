import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const REPO_METADATA_PATH = path.join(PROJECT_ROOT, 'agent/output/repo-scan-result.json');
const MEMORY_PATH = path.join(PROJECT_ROOT, 'agent/context/memory.json');

async function generatePatch(routingPlanPath) {
  if (!fs.existsSync(routingPlanPath)) {
    throw new Error(`Routing plan not found: ${routingPlanPath}`);
  }

  const routingPlan = JSON.parse(fs.readFileSync(routingPlanPath, 'utf8'));
  const repoMetadata = JSON.parse(fs.readFileSync(REPO_METADATA_PATH, 'utf8'));
  const memory = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));

  const patchProposal = {
    proposed_at: new Date().toISOString(),
    source_routing_plan: path.relative(PROJECT_ROOT, routingPlanPath),
    patches: []
  };

  routingPlan.assignments.forEach(assignment => {
    let patch = {
      incident_code: assignment.incident_code,
      assigned_skill: assignment.assigned_skill,
      proposed_changes: [],
      reasoning: assignment.reason
    };

    // Heuristics for surgical changes based on incident code
    if (assignment.incident_code === 'EBRN_KEY_MISSING') {
      patch.proposed_changes.push({
        action: 'ADD_ENV_VAR',
        target: '.env.local',
        details: `Missing API key for ${assignment.incident_route}. Add the required key to the environment variables.`
      });
    } else if (assignment.incident_code === 'EBRN_WL_DENY') {
      patch.proposed_changes.push({
        action: 'UPDATE_WHITELIST',
        target: 'agent/context/whitelist.json',
        details: `Request blocked by whitelist for ${assignment.incident_route}. Propose adding an allow rule to the whitelist.`
      });
    } else if (assignment.incident_code === 'EBU.TOKENS.CONTEXT_LIMIT') {
      patch.proposed_changes.push({
        action: 'REDUCE_INPUT_SIZE',
        target: assignment.incident_route,
        details: `Token limit exceeded. Propose adding input truncation or a larger model alias in the request parameters.`
      });
    } else {
      patch.proposed_changes.push({
        action: 'CODE_PATCH',
        target: assignment.incident_route,
        details: `Generic backend fix for ${assignment.incident_route}. Investigate the route logic and add necessary error handling or validation.`
      });
    }

    patchProposal.patches.push(patch);
  });

  console.log(JSON.stringify(patchProposal, null, 2));
}

const args = process.argv.slice(2);
const routingPlanFile = args[0];

if (!routingPlanFile) {
  console.error('Usage: node patch-generator.mjs <routing-plan-file>');
  process.exit(1);
}

generatePatch(routingPlanFile).catch(console.error);
