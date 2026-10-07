'use strict';

const fs = require('node:fs');
const path = require('node:path');

const dashboardRoot = path.resolve(__dirname);
const projectRoot = path.resolve(__dirname, '..');
const dist = path.resolve(dashboardRoot, 'dist');
const staging = path.resolve(dashboardRoot, 'dist.__build__');
const assets = ['index.html', 'app.js', 'styles.css', 'syntax.js', 'PRISM-LICENSE.txt'];
const rootFiles = ['README.md', 'package.json', 'playwright.config.ts'];
const rootDirectories = ['docs', 'evidencias', 'tests'];
const excludedDirectories = new Set(['node_modules', 'tmp', 'playwright-report', 'test-results', 'blob-report']);
const slash = value => value.replace(/\\/g, '/');

function within(root, filename) {
  const relative = path.relative(root, filename);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' &&
    !relative.startsWith(`..${path.sep}`));
}

function removeOutput(target) {
  const absolute = path.resolve(target);
  if (!within(dashboardRoot, absolute) || path.dirname(absolute) !== dashboardRoot ||
    !['dist', 'dist.__build__'].includes(path.basename(absolute))) {
    throw new Error('Limpeza recusada: saída fora da pasta dashboard.');
  }
  if (fs.existsSync(absolute) && fs.lstatSync(absolute).isSymbolicLink()) {
    throw new Error('Limpeza recusada: a saída é um link simbólico.');
  }
  fs.rmSync(absolute, { recursive: true, force: true });
}

function excluded(name, directory) {
  return name.startsWith('.') || (directory && excludedDirectories.has(name.toLowerCase())) ||
    /(?:^|[_.-])(?:env|tokens?|credentials|secrets?)(?:[_.-]|$)/i.test(name);
}

function allowedRelativeFile(filename) {
  if (typeof filename !== 'string' || path.isAbsolute(filename)) return false;
  const parts = slash(filename).split('/');
  if (parts.some((part, index) => !part || part === '.' || part === '..' ||
    excluded(part, index < parts.length - 1))) return false;
  return (parts.length === 1 && rootFiles.includes(parts[0])) ||
    (parts.length > 1 && rootDirectories.includes(parts[0]));
}

function copyTree(source, destination) {
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) return;
  if (excluded(path.basename(source), stat.isDirectory())) return;
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || excluded(entry.name, entry.isDirectory())) continue;
      copyTree(path.join(source, entry.name), path.join(destination, entry.name));
    }
  } else if (stat.isFile()) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

function requireFile(filename, label) {
  if (!fs.existsSync(filename) || fs.lstatSync(filename).isSymbolicLink() ||
    !fs.statSync(filename).isFile()) {
    throw new Error(`Arquivo obrigatório ausente ou inválido: ${label}.`);
  }
}

function validateReferences(data, outputRoot) {
  const refs = new Set(rootFiles);
  const keys = new Set(['path', 'sourcePath', 'recordPath', 'beforePath', 'afterPath', 'montagePath']);
  const allowed = /^(?:README\.md$|package\.json$|playwright\.config\.ts$|(?:docs|evidencias|tests)\/)/;
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === 'string' && keys.has(key) && allowed.test(slash(child))) refs.add(slash(child));
      if (key === 'sourcePaths' && Array.isArray(child)) {
        for (const file of child) if (typeof file === 'string' && allowed.test(slash(file))) refs.add(slash(file));
      }
      if (child && typeof child === 'object') visit(child);
    }
  };
  visit(data);
  for (const ref of refs) {
    const filename = path.resolve(outputRoot, 'files', ref);
    const filesRoot = path.resolve(outputRoot, 'files');
    if (!within(filesRoot, filename)) throw new Error(`Referência fora do escopo: ${ref}.`);
    requireFile(filename, ref);
  }
  return refs.size;
}

function build() {
  try {
    for (const asset of assets) requireFile(path.join(dashboardRoot, asset), asset);
    for (const file of rootFiles) requireFile(path.join(projectRoot, file), file);
    for (const directory of rootDirectories) {
      const source = path.join(projectRoot, directory);
      if (!fs.existsSync(source) || fs.lstatSync(source).isSymbolicLink() || !fs.statSync(source).isDirectory()) {
        throw new Error(`Pasta obrigatória ausente ou inválida: ${directory}.`);
      }
    }
    const { buildData } = require('./lib/data-builder.cjs');
    const data = buildData(projectRoot);
    if (!data || !Array.isArray(data.errors) || data.errors.length !== 0) {
      const errors = data?.errors || [{ message: 'Dados incompletos.' }];
      throw new Error(`Build recusado: ${errors.map(item => item.message || String(item)).join(' ')}`);
    }
    if (!Array.isArray(data.cases) || !data.summary ||
      data.summary.totalCases !== data.cases.length ||
      new Set(data.cases.map(item => item.id)).size !== data.cases.length) {
      throw new Error('Build recusado: contagem ou identificação dos casos inconsistente.');
    }
    // The source projection can include placeholders such as tests/.gitkeep.
    // Only documents that can be included in the public artifact remain listed.
    data.documents = (data.documents || []).filter(document => allowedRelativeFile(document.path));
    data.summary.documentCount = data.documents.length;
    removeOutput(staging);
    fs.mkdirSync(staging, { recursive: true });
    for (const asset of assets) fs.copyFileSync(path.join(dashboardRoot, asset), path.join(staging, asset));
    for (const file of rootFiles) copyTree(path.join(projectRoot, file), path.join(staging, 'files', file));
    for (const directory of rootDirectories) copyTree(path.join(projectRoot, directory), path.join(staging, 'files', directory));
    fs.writeFileSync(path.join(staging, 'data.json'), JSON.stringify(data), 'utf8');
    fs.writeFileSync(path.join(staging, '.nojekyll'), '', 'utf8');
    const references = validateReferences(data, staging);
    removeOutput(dist);
    fs.renameSync(staging, dist);
    console.log(`Build: dashboard/dist · ${data.cases.length} casos · ${references} referências verificadas.`);
    return { directory: dist, cases: data.cases.length, references };
  } catch (error) {
    for (const target of [staging, dist]) {
      try { removeOutput(target); }
      catch (cleanupError) { console.error(cleanupError.message); }
    }
    throw error;
  }
}

module.exports = { build };
if (require.main === module) {
  try { build(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
