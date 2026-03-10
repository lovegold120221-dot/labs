import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const SKILLS_MANIFEST_PATH = path.join(PROJECT_ROOT, 'agent/SKILLS.md');

// Skill Mapping Rules
const ROUTING_RULES = [
  {
    skill_id: 'backend-bug-fix',
    criteria: (incident) => incident.route.startsWith('api/') || incident.status >= 500,
    priority: 100
  },
  {
    skill_id: 'config-audit',
    criteria: (incident) => incident.code.includes('KEY_MISSING') || incident.code.includes('WL_DENY'),
    priority: 110 // Higher priority as config issues often block other fixes
  },
  {
    skill_id: 'frontend-bug-fix',
    criteria: (incident) => incident.route === 'unknown' && incident.message.toLowerCase().includes('component'),
    priority: 90
  },
  {
    skill_id: 'type-fix',
    criteria: (incident) => incident.message.toLowerCase().includes('typescript') || incident.message.toLowerCase().includes('type error'),
    priority: 80
  }
];

async function routeSkills(reportPath) {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report file not found: ${reportPath}`);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const plan = {
    routed_at: new Date().toISOString(),
    source_report: path.relative(PROJECT_ROOT, reportPath),
    assignments: []
  };

  report.incidents.forEach(incident => {
    let bestSkill = null;
    let maxPriority = -1;

    for (const rule of ROUTING_RULES) {
      if (rule.criteria(incident) && rule.priority > maxPriority) {
        bestSkill = rule.skill_id;
        maxPriority = rule.priority;
      }
    }

    if (bestSkill) {
      plan.assignments.push({
        incident_code: incident.code,
        incident_route: incident.route,
        assigned_skill: bestSkill,
        reason: `Matched routing rule for ${bestSkill} based on incident attributes.`
      });
    }
  });

  // Deduplicate and summarize
  const uniqueSkills = [...new Set(plan.assignments.map(a => a.assigned_skill))];
  plan.summary = {
    recommended_skills: uniqueSkills,
    total_assignments: plan.assignments.length
  };

  console.log(JSON.stringify(plan, null, 2));
}

const args = process.argv.slice(2);
const reportFile = args[0];

if (!reportFile) {
  console.error('Usage: node skill-router.mjs <report-file>');
  process.exit(1);
}

routeSkills(reportFile).catch(console.error);
