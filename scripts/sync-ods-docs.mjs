#!/usr/bin/env node
/**
 * Regenerates docs/ods/ from installed @ongov packages.
 * AUTO-GENERATED outputs — do not edit docs/ods/* by hand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'docs', 'ods');
const nodeModules = path.join(root, 'node_modules');

const HEADER = '<!-- AUTO-GENERATED — do not edit — run npm run sync:ods-docs -->\n\n';

const ONGOV_PACKAGES = [
  'ontario-design-system-component-library-react',
  'ontario-design-system-global-styles',
  'ontario-design-system-component-library',
  'ontario-design-system-design-tokens',
];

function readPkgJson(pkgName) {
  const pkgPath = path.join(nodeModules, '@ongov', pkgName, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

function readFileOrNull(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function kebabFromExport(name) {
  return name
    .replace(/^Ontario/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/Icon([A-Z])/g, (_, c) => `icon-${c}`)
    .toLowerCase()
    .replace(/^icon-/, 'icon-');
}

function componentDocUrl(exportName) {
  const kebab = kebabFromExport(exportName);
  if (exportName.startsWith('OntarioIcon')) {
    return `https://designsystem.ontario.ca/developer-docs/components/ontario-icon-${kebab.replace(/^icon-/, '')}/`;
  }
  return `https://designsystem.ontario.ca/developer-docs/components/ontario-${kebab}/`;
}

function parseReactExports(componentsDts) {
  const regex = /export declare const (Ontario[A-Za-z0-9]+):/g;
  const names = [];
  let match;
  while ((match = regex.exec(componentsDts)) !== null) {
    names.push(match[1]);
  }
  return names.sort();
}

function generateComponentIndex(exports) {
  const components = exports.filter((n) => !n.startsWith('OntarioIcon'));
  const icons = exports.filter((n) => n.startsWith('OntarioIcon'));

  let md = HEADER;
  md += '# Ontario Design System — React Component Index\n\n';
  md += `Generated from \`@ongov/ontario-design-system-component-library-react/dist/components.d.ts\`.\n\n`;
  md += 'Import path: `@ongov/ontario-design-system-component-library-react`\n\n';
  md += `Total exports: ${exports.length} (${components.length} components, ${icons.length} icons)\n\n`;

  md += '## Components\n\n';
  md += '| React export | Developer docs |\n| --- | --- |\n';
  for (const name of components) {
    md += `| \`${name}\` | [docs](${componentDocUrl(name)}) |\n`;
  }

  md += '\n## Icons\n\n';
  md += '| React export | Developer docs |\n| --- | --- |\n';
  for (const name of icons) {
    md += `| \`${name}\` | [docs](${componentDocUrl(name)}) |\n`;
  }

  return md;
}

function parseComponentsNamespace(content) {
  const start = content.indexOf('export namespace Components {');
  const end = content.indexOf('declare global {');
  if (start === -1 || end === -1) return [];

  const block = content.slice(start, end);
  const interfaceRegex = /\/\*\*([\s\S]*?)\*\/\s*\n\s*interface (Ontario[A-Za-z0-9]+)\s*\{([\s\S]*?)\n\t\}/g;
  const components = [];

  let match;
  while ((match = interfaceRegex.exec(block)) !== null) {
    const summary = match[1]
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, '').trim())
      .filter(Boolean)
      .join('\n');

    const name = match[2];
    const body = match[3];
    const urls = [...summary.matchAll(/https:\/\/designsystem\.ontario\.ca[^\s)]+/g)].map((m) => m[0]);

    const props = [];
    const propRegex = /\/\*\*([\s\S]*?)\*\/\s*\n\s*([a-zA-Z0-9_]+)(\?)?:\s*([^;\n]+);/g;
    let propMatch;
    while ((propMatch = propRegex.exec(body)) !== null) {
      const doc = propMatch[1]
        .split('\n')
        .map((line) => line.replace(/^\s*\*\s?/, '').trim())
        .filter((line) => line && !line.startsWith('@'))
        .join(' ');
      const propName = propMatch[2];
      const optional = Boolean(propMatch[3]);
      const propType = propMatch[4].trim();
      if (propName.startsWith('on') && propName[2]?.toUpperCase() === propName[2]) continue;
      props.push({ name: propName, optional, type: propType, doc });
    }

    components.push({ name, summary, urls: [...new Set(urls)], props });
  }

  return components.sort((a, b) => a.name.localeCompare(b.name));
}

function generateComponentApiFromNamespace(componentsDts) {
  let md = HEADER;
  md += '# Ontario Design System — Component API\n\n';
  md += 'Extracted from `@ongov/ontario-design-system-component-library/dist/types/components.d.ts` (Components namespace).\n\n';
  md += 'Use only props listed below. If a prop is not listed, do not use it.\n\n';

  const parsed = parseComponentsNamespace(componentsDts);

  for (const component of parsed) {
    md += `## ${component.name}\n\n`;
    if (component.summary) {
      md += `${component.summary}\n\n`;
    }
    if (component.urls.length) {
      md += '**Official links:**\n';
      for (const url of component.urls) {
        md += `- ${url}\n`;
      }
      md += '\n';
    }
    if (component.props.length) {
      md += '| Prop | Type | Required | Description |\n| --- | --- | --- | --- |\n';
      for (const prop of component.props) {
        const desc = prop.doc.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        md += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.optional ? 'no' : 'yes'} | ${desc || '—'} |\n`;
      }
    } else {
      md += '_No public props extracted from type definitions._\n';
    }
    md += '\n';
  }

  return md;
}

function generateComponentApi(componentsDts) {
  if (componentsDts) {
    return generateComponentApiFromNamespace(componentsDts);
  }

  let md = HEADER;
  md += '# Ontario Design System — Component API\n\n';
  md += '_Run npm install to generate._\n';
  return md;
}

function parseScssVariables(content) {
  const vars = [];
  const regex = /(\$ontario[a-zA-Z0-9-]*)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    vars.push({ name: match[1], value: match[2].trim() });
  }
  return vars;
}

function generateTokens(globalStylesPkg) {
  const varsDir = path.join(
    globalStylesPkg,
    'dist',
    'styles',
    'scss',
    '1-variables',
  );

  let md = HEADER;
  md += '# Ontario Design System — Design Tokens\n\n';
  md += 'Extracted from `@ongov/ontario-design-system-global-styles/dist/styles/scss/1-variables/`.\n\n';
  md += 'Use only token names listed below in custom SCSS.\n\n';

  if (!fs.existsSync(varsDir)) {
    md += '_Token variable files not found. Run npm install first._\n';
    return md;
  }

  const files = fs
    .readdirSync(varsDir)
    .filter((f) => f.endsWith('.scss'))
    .sort();

  for (const file of files) {
    const content = fs.readFileSync(path.join(varsDir, file), 'utf8');
    const vars = parseScssVariables(content);
    if (!vars.length) continue;

    md += `## ${file.replace(/^_/, '').replace(/\.scss$/, '')}\n\n`;
    md += '| Token | Value |\n| --- | --- |\n';
    for (const v of vars) {
      md += `| \`${v.name}\` | ${v.value} |\n`;
    }
    md += '\n';
  }

  return md;
}

function generateVersion() {
  let md = HEADER;
  md += '# Ontario Design System — Installed Versions\n\n';
  md += `Synced at: ${new Date().toISOString()}\n\n`;
  md += '| Package | Version |\n| --- | --- |\n';

  for (const pkgName of ONGOV_PACKAGES) {
    const pkg = readPkgJson(pkgName);
    md += `| \`@ongov/${pkgName}\` | ${pkg?.version ?? 'not installed'} |\n`;
  }

  return md;
}

function copyPackageLlms() {
  const copied = [];
  for (const pkgName of ONGOV_PACKAGES) {
    const llmsPath = path.join(nodeModules, '@ongov', pkgName, 'llms.txt');
    const content = readFileOrNull(llmsPath);
    if (!content) continue;
    const outName = `llms-package-${pkgName}.txt`;
    fs.writeFileSync(path.join(docsDir, outName), content);
    copied.push(outName);
  }
  return copied;
}

function generateProjectLlms(copiedLlms) {
  let txt = '# OPS-RBAC — Ontario Design System AI Catalog\n\n';
  txt += 'Read AGENTS.md first.\n\n';
  txt += '## Project catalogs (single source of truth)\n\n';
  txt += '- Component list: docs/ods/COMPONENT-INDEX.md\n';
  txt += '- Component props: docs/ods/COMPONENT-API.md\n';
  txt += '- Design tokens: docs/ods/TOKENS.md\n';
  txt += '- Installed versions: docs/ods/VERSION.md\n\n';
  txt += '## Project constraints\n\n';
  txt += '- Stack: Vite + React 19 SPA\n';
  txt += '- Asset base path: /assets/\n';
  txt += '- Global styles: @ongov/ontario-design-system-global-styles/styles/css/compiled/ontario-theme.min.css (imported in src/main.tsx)\n';
  txt += '- Import components from @ongov/ontario-design-system-component-library-react\n';
  txt += '## Official package llms.txt copies\n\n';
  for (const file of copiedLlms) {
    txt += `- docs/ods/${file}\n`;
  }
  txt += '\n## Official links\n\n';
  txt += '- https://designsystem.ontario.ca/developer-docs/\n';
  txt += '- https://designsystem.ontario.ca/components/\n';
  return txt;
}

function main() {
  ensureDir(docsDir);

  const reactPkg = path.join(nodeModules, '@ongov', 'ontario-design-system-component-library-react');
  const corePkg = path.join(nodeModules, '@ongov', 'ontario-design-system-component-library');
  const globalPkg = path.join(nodeModules, '@ongov', 'ontario-design-system-global-styles');

  const componentsDts = readFileOrNull(path.join(reactPkg, 'dist', 'components.d.ts'));
  if (componentsDts) {
    const exports = parseReactExports(componentsDts);
    fs.writeFileSync(
      path.join(docsDir, 'COMPONENT-INDEX.md'),
      generateComponentIndex(exports),
    );
  } else {
    fs.writeFileSync(
      path.join(docsDir, 'COMPONENT-INDEX.md'),
      `${HEADER}# Component Index\n\n_Run npm install to generate._\n`,
    );
  }

  const componentsNamespaceDts = readFileOrNull(
    path.join(corePkg, 'dist', 'types', 'components.d.ts'),
  );
  fs.writeFileSync(
    path.join(docsDir, 'COMPONENT-API.md'),
    generateComponentApi(componentsNamespaceDts),
  );

  fs.writeFileSync(path.join(docsDir, 'TOKENS.md'), generateTokens(globalPkg));
  fs.writeFileSync(path.join(docsDir, 'VERSION.md'), generateVersion());

  const copiedLlms = copyPackageLlms();
  fs.writeFileSync(path.join(docsDir, 'llms.txt'), generateProjectLlms(copiedLlms));

  console.log('Synced docs/ods/ from installed @ongov packages.');
}

main();
