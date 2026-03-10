import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

async function scan() {
  const metadata = {
    project_root: PROJECT_ROOT,
    scanned_at: new Date().toISOString(),
    tech_stack: {
      framework: null,
      language: 'TypeScript',
      styling: null,
      backend: null,
      voice_ai: null,
    },
    directories: [],
    api_routes: [],
    components: [],
    config_files: [],
    env_vars: new Set(),
  };

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'agent') continue;
        metadata.directories.push(path.relative(PROJECT_ROOT, filePath));
        walk(filePath);
      } else {
        const relPath = path.relative(PROJECT_ROOT, filePath);
        
        // Identify Config Files
        if (file.includes('config') || file.endsWith('.json') || file.startsWith('.')) {
          metadata.config_files.push(relPath);
        }

        // Identify API Routes
        if (relPath.includes('src/app/api') && (file === 'route.ts' || file === 'route.js')) {
          metadata.api_routes.push(path.dirname(relPath).replace('src/app/api/', ''));
        }

        // Identify Components
        if (relPath.includes('src/components') && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
          metadata.components.push(relPath);
        }

        // Scan for Env Vars
        if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
          const content = fs.readFileSync(filePath, 'utf8');
          const matches = content.matchAll(/process\.env\.([A-Z0-9_]+)/g);
          for (const match of matches) {
            metadata.env_vars.add(match[1]);
          }
        }
      }
    }
  }

  walk(PROJECT_ROOT);

  // Architecture Detection
  if (fs.existsSync(path.join(PROJECT_ROOT, 'next.config.ts')) || fs.existsSync(path.join(PROJECT_ROOT, 'next.config.js'))) {
    metadata.tech_stack.framework = 'Next.js';
  }
  
  const pkgJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
  if (pkgJson.dependencies['@supabase/supabase-js']) metadata.tech_stack.backend = 'Supabase';
  if (pkgJson.dependencies['tailwindcss'] || pkgJson.devDependencies['tailwindcss']) metadata.tech_stack.styling = 'Tailwind CSS';
  if (pkgJson.dependencies['@vapi-ai/web']) metadata.tech_stack.voice_ai = 'Vapi';

  metadata.env_vars = Array.from(metadata.env_vars);

  console.log(JSON.stringify(metadata, null, 2));
}

scan().catch(console.error);
