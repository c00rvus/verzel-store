'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { caseDescriptions } = require('./case-descriptions.cjs');
const { buildAutomationData } = require('./automation-data.cjs');

const slash = value => value.replace(/\\/g, '/');
const unique = values => [...new Set(values.filter(Boolean))];
const imagePattern = /\.(?:png|jpe?g|gif|webp|svg)$/i;

function plain(value = '') {
  return String(value).replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/!?\[([^\]]*)\]\([^)]+\)/g, '$1').replace(/[*`]/g, '').trim();
}

function rowCells(line) {
  if (!line.trim().startsWith('|')) return [];
  const source = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cell = '', code = false;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (char === '\\' && source[index + 1] === '|') { cell += '|'; index++; }
    else if (char === '`') { code = !code; cell += char; }
    else if (char === '|' && !code) { cells.push(cell.trim()); cell = ''; }
    else cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

function sections(markdown) {
  const headings = [...markdown.matchAll(/^##\s+(.+)\r?$/gm)];
  return headings.map((heading, index) => ({
    title: heading[1].trim(),
    body: markdown.slice(heading.index + heading[0].length,
      headings[index + 1]?.index ?? markdown.length).trim()
  }));
}

function fileType(file) {
  if (imagePattern.test(file)) return 'image';
  if (/\.json$/i.test(file)) return 'json';
  if (/\.md$/i.test(file)) return 'markdown';
  if (/\.feature$/i.test(file)) return 'gherkin';
  if (/\.(?:[cm]?[jt]s|tsx)$/i.test(file)) return 'code';
  return 'text';
}

function uiActualSummary(value) {
  const monetaryFields = ['Subtotal', 'Desconto', 'Frete', 'Total'];
  if (typeof value === 'string') {
    const anchor = value.lastIndexOf('Resumo do pedido');
    const source = anchor >= 0 ? value.slice(anchor) : value;
    const amounts = monetaryFields.map(label => {
      const match = new RegExp(`\\b${label}\\b`, 'i').exec(source);
      if (!match) return null;
      const after = source.slice(match.index + match[0].length);
      const next = /\b(?:Subtotal|Desconto|Frete|Total)\b/i.exec(after);
      const field = next ? after.slice(0, next.index) : after;
      return field.match(/R\$\s*([\d.]+,\d{2})/)?.[1] ||
        (/\bGr[aá]tis\b/i.test(field) ? '0,00' : null);
    });
    if (amounts.every(Boolean)) {
      const missing = source.match(/Faltam\s+R\$\s*([\d.]+,\d{2})/i)?.[1];
      return `${amounts.join(' / ')}${missing ? `; faltante ${missing}` : ''}`;
    }
    return value.trim().length <= 500 ? value.trim() : null;
  }
  if (value && typeof value === 'object') {
    const numbers = ['subtotal', 'desconto', 'frete', 'total'].map(field => value[field]);
    if (numbers.every(amount => typeof amount === 'number' && Number.isFinite(amount))) {
      return numbers.map(amount => amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      })).join(' / ');
    }
  }
  return null;
}

/** Read-only projection of repository records. No browser, HTTP or test execution. */
function buildData(root) {
  if (typeof root !== 'string' || !root.trim()) {
    throw new TypeError('Informe a pasta raiz do projeto para construir os dados.');
  }
  const projectRoot = path.resolve(root);
  const errors = [];
  const textCache = new Map();
  const jsonCache = new Map();
  const recordError = (file, operation, message) => errors.push({ path: file, operation, message });

  function read(file) {
    if (textCache.has(file)) return textCache.get(file);
    try {
      const content = fs.readFileSync(path.join(projectRoot, file), 'utf8').replace(/^\uFEFF/, '');
      textCache.set(file, content);
      return content;
    } catch (error) {
      recordError(file, 'leitura', `Não foi possível ler o arquivo (${error.code || 'erro de leitura'}).`);
      textCache.set(file, '');
      return '';
    }
  }

  function readJson(file) {
    if (jsonCache.has(file)) return jsonCache.get(file);
    const content = read(file);
    let result = null;
    if (content) {
      try { result = JSON.parse(content); }
      catch { recordError(file, 'JSON', 'O conteúdo não é um JSON válido.'); }
    }
    jsonCache.set(file, result);
    return result;
  }

  function walk(directory, ignored = new Set()) {
    const found = [];
    const visit = relative => {
      let entries;
      try { entries = fs.readdirSync(path.join(projectRoot, relative), { withFileTypes: true }); }
      catch (error) {
        if (error.code !== 'ENOENT') recordError(relative || '.', 'listagem', `Não foi possível listar a pasta (${error.code || 'erro'}).`);
        return;
      }
      for (const entry of entries) {
        if (entry.isSymbolicLink() || ignored.has(entry.name)) continue;
        const child = path.posix.join(slash(relative), entry.name);
        if (entry.isDirectory()) visit(child);
        else if (entry.isFile()) found.push(child);
      }
    };
    visit(directory);
    return found.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  function links(text, owner) {
    const result = [];
    for (const match of text.matchAll(/!?\[([^\]]*)\]\(([^)]+)\)/g)) {
      let target = match[2].trim().replace(/^<|>$/g, '').split('#')[0];
      if (!target || /^(?:[a-z]+:|\/)/i.test(target)) continue;
      try { target = decodeURIComponent(target); } catch { /* Preserve a literal local path. */ }
      const file = path.posix.normalize(path.posix.join(path.posix.dirname(owner), slash(target)));
      if (file === '..' || file.startsWith('../')) {
        recordError(owner, 'link', 'Referência fora da pasta do projeto ignorada.');
        continue;
      }
      result.push({ path: file, label: plain(match[1]), type: fileType(file) });
    }
    return result;
  }

  const execution = read('docs/execucao.md');
  const scenarioText = read('docs/cenarios.md');
  const evidenceText = read('docs/evidencias.md');
  const bugText = read('docs/bugs.md');
  const readme = read('README.md');

  const cases = [];
  const caseIds = new Set();
  let layer = null;
  for (const line of execution.split(/\r?\n/)) {
    if (/^## UI\b/.test(line)) layer = 'UI';
    else if (/^## API\b/.test(line)) layer = 'API';
    else if (/^## /.test(line)) layer = null;
    const cells = rowCells(line);
    const id = plain(cells[0]);
    if (!layer || !/^CT-\d{3}(?:$|-)/.test(id) || cells.length < 7) continue;
    if (caseIds.has(id)) {
      recordError('docs/execucao.md', 'casos', `ID repetido ignorado: ${id}.`);
      continue;
    }
    caseIds.add(id);
    cases.push({
      id, layer, group: id.match(/^CT-\d{3}/)[0], input: plain(cells[1]),
      date: plain(cells[2]), expected: plain(cells[3]), actual: plain(cells[4]),
      status: plain(cells[5]), evidenceId: cells[6].match(/EV-\d{3}/)?.[0] || null,
      bugIds: unique(line.match(/BUG-\d{3}/g) || [])
    });
  }

  const groups = [];
  for (const line of scenarioText.split(/\r?\n/)) {
    const cells = rowCells(line);
    const id = plain(cells[0]);
    if (!/^CT-\d{3}$/.test(id) || cells.length < 4) continue;
    const objective = plain(cells[1]);
    groups.push({ id, title: objective, objective,
      criteria: plain(cells[2]).split(/\s*,\s*/).filter(Boolean),
      features: unique(links(cells[3], 'docs/cenarios.md').map(link => link.path)),
      caseIds: cases.filter(item => item.group === id).map(item => item.id)
    });
  }

  const criteriaById = new Map();
  for (const line of scenarioText.split(/\r?\n/)) {
    const cells = rowCells(line);
    const id = plain(cells[0]);
    if (!/^CA\d{2}$/.test(id) || cells.length < 2) continue;
    const description = plain(cells[1]);
    if (description) criteriaById.set(id, { id, description });
  }
  const criteria = [...criteriaById.values()].sort((a, b) => a.id.localeCompare(b.id));

  // Case packages are projections of the original sources, not new executions.
  const isCasePackage = file => /(?:^|\/)cenarios(?:\/|$)/i.test(slash(file));
  const isAutomationEvidence = file => /^evidencias\/automacao\//i.test(slash(file));
  const evidenceFiles = walk('evidencias').filter(file => !isCasePackage(file) && !isAutomationEvidence(file));
  const sourceJsonPaths = evidenceFiles.filter(file => /\.json$/i.test(file));
  const automationRecordPath = 'evidencias/automacao/2026-10-07/resultado.json';
  const hasAutomationRecord = fs.existsSync(path.join(projectRoot, automationRecordPath));
  const automationRecord = hasAutomationRecord ? readJson(automationRecordPath) : null;
  const sourceRecords = [];
  const manifestByPath = new Map();
  const statuses = new Set(['aprovado', 'reprovado', 'bloqueado', 'não executado', 'nao executado']);
  const recordId = record => record?.caseId || record?.id;
  const timestamp = record => record?.observadoEmUTC || record?.recordedAtUTC || null;
  const validTimestamp = value => typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
  const actualValue = record => record?.obtido ?? record?.actual;
  const validActual = value => typeof value === 'string' ? Boolean(value.trim()) :
    value != null && typeof value === 'object' && Object.keys(value).length > 0;
  const localDate = value => new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/New_York', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).format(new Date(value)).replace(',', '');

  function recordList(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.resultados)) return value.resultados;
    if (Array.isArray(value?.results)) return value.results;
    if (value && typeof value === 'object' && typeof recordId(value) === 'string') return [value];
    return [];
  }

  for (const sourcePath of sourceJsonPaths) {
    const contents = readJson(sourcePath);
    for (const record of recordList(contents)) {
      if (!record || typeof record !== 'object') continue;
      const id = recordId(record);
      if (typeof id === 'string') sourceRecords.push({ record, id, sourcePath });
      const capturePath = record.arquivo || record.path;
      if (typeof capturePath !== 'string' || !imagePattern.test(capturePath)) continue;
      const file = path.posix.normalize(capturePath.startsWith('evidencias/')
        ? slash(capturePath) : path.posix.join(path.posix.dirname(sourcePath), slash(capturePath)));
      if (!file.startsWith('evidencias/') || isCasePackage(file)) continue;
      const previous = manifestByPath.get(file);
      const time = record.observadoEmUTC || record.time || null;
      const previousTime = Date.parse(previous?.time);
      if (!previous || (validTimestamp(time) &&
        (!Number.isFinite(previousTime) || Date.parse(time) >= previousTime))) {
        manifestByPath.set(file, {
          stage: record.etapa || record.stage || '', time, sourcePath,
          caseId: record.caseId || record.cenario || null
        });
      }
    }
  }
  const oldCaseAliases = {
    'CT-003-API-C': 'CT-003-A', 'CT-003-API-P': 'CT-003-B',
    'CT-004-API-C': 'CT-004-A', 'CT-004-API-P': 'CT-004-B',
    'CT-009-API-5C': 'CT-009-A', 'CT-009-API-6C': 'CT-009-B',
    'CT-011-API-01': 'CT-011-A', 'CT-011-API-03': 'CA08-base-antes-desconto',
    'CT-012-API-01': 'CT-012-A', 'CT-012-API-02': 'CT-012-B',
    'CT-013-API-tres-campos': 'CT-013-A',
    'CT-014-API-catalogo': 'CT-014-A', 'CT-014-API-P005': 'CT-014-B', 'CT-014-API-P999': 'CT-014-C',
    'CT-015-API-05': 'CT-015-D', 'CT-015-API-06': 'CT-015-E',
    'CT-016-API-json-invalido': 'CT-016-A', 'CT-016-API-rota-inexistente': 'CT-016-B',
    'CT-016-API-metodo-invalido': 'CT-016-C'
  };
  function latestRecord(candidates, preferComplements = false) {
    return candidates.sort((a, b) => {
      const rank = source => preferComplements && /\/ui-complementos\.json$/i.test(source.sourcePath) ? 1 : 0;
      return rank(b) - rank(a) ||
        (Date.parse(timestamp(b.record)) || 0) - (Date.parse(timestamp(a.record)) || 0);
    })[0] || null;
  }

  // A reexecution can replace an existing case's observed data, never add a case.
  for (const item of cases) {
    if (item.layer === 'UI') {
      const candidates = sourceRecords.filter(source => source.id === item.id &&
        statuses.has(String(source.record.status || '').toLowerCase()) &&
        validActual(actualValue(source.record)) && validTimestamp(timestamp(source.record)));
      const previous = latestRecord(candidates.filter(source => !/\/ui-complementos\.json$/i.test(source.sourcePath)));
      if (previous) Object.assign(item, { dados: previous.record.dados || null,
        sourcePath: previous.sourcePath, sourceId: recordId(previous.record),
        recordedAtUTC: timestamp(previous.record) });
      const candidate = latestRecord(candidates, true);
      if (candidate) {
        const { record, sourcePath } = candidate;
        if (/\/ui-complementos\.json$/i.test(sourcePath)) item.originalRecord = { ...item };
        Object.assign(item, { dados: record.dados || null, sourcePath,
          sourceId: recordId(record), recordedAtUTC: timestamp(record) });
        if (/\/ui-complementos\.json$/i.test(sourcePath)) {
          const actual = uiActualSummary(actualValue(record));
          Object.assign(item, { date: localDate(timestamp(record)),
            status: String(record.status), ...(actual != null ? { actual } : {}) });
        }
      }
      continue;
    }
    const aliases = [item.id, oldCaseAliases[item.id]];
    if (/^CT-006-API-0[12]$/.test(item.id)) {
      aliases.push(item.id.endsWith('01') ? 'CT-006-com-cupom' : 'CT-006-sem-cupom');
    }
    const candidate = latestRecord(sourceRecords.filter(source => aliases.includes(source.id) &&
      Number.isFinite(source.record.status) &&
      (source.record.response != null || source.record.responseRaw != null)));
    if (!candidate) {
      recordError('docs/execucao.md', 'fonte API', `Não foi localizado o registro JSON do caso ${item.id}.`);
      continue;
    }
    const { record, sourcePath } = candidate;
    const route = item.input.match(/^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+(\/[^;\s]+)/);
    Object.assign(item, { request: record.request ?? record.requestRaw ?? null,
      response: record.response ?? record.responseRaw ?? null, httpStatus: record.status,
      method: record.method || route?.[1] || null, path: record.path || route?.[2] || null,
      sourcePath, sourceId: record.id, recordedAtUTC: record.observadoEmUTC || null });
  }

  const evidenceGroups = [];
  const evidenceById = new Map();
  function addEvidence(id, title, description, markdown, old = false) {
    const fileMap = new Map();
    const hour = old ? description.match(/\b\d{2}:\d{2}(?::\d{2})?\b/)?.[0] : null;
    const fallbackTime = old
      ? `06/10/2026${hour ? ` ${hour} (Brasília, UTC-03:00)` : ' (horário não registrado; Brasília, UTC-03:00)'}`
      : null;
    for (const line of markdown.split(/\r?\n/)) {
      const cells = rowCells(line);
      const stageRow = cells.length === 3 && /\d{2}\/\d{2}/.test(cells[1]);
      for (const link of links(line, 'docs/evidencias.md')) {
        const metadata = manifestByPath.get(link.path);
        const previous = fileMap.get(link.path);
        const stage = metadata?.stage || (stageRow ? plain(cells[0]) : previous?.stage || (old ? description : link.label));
        const time = metadata?.time || (stageRow ? `${plain(cells[1])} (UTC-04:00)` : previous?.time || fallbackTime);
        fileMap.set(link.path, { path: link.path, label: link.label || path.posix.basename(link.path), stage, time, type: link.type });
      }
    }
    const directCases = cases.filter(item => item.evidenceId === id).map(item => item.id);
    const mentioned = plain(markdown).match(/\b(?:CT-\d{3}(?:-[\w-]+)?|EXP-\d{2})\b/g) || [];
    const related = directCases.length ? directCases : unique(mentioned);
    const entry = { id, title: plain(title), cases: related, description: plain(description), files: [...fileMap.values()] };
    evidenceGroups.push(entry);
    evidenceById.set(id, entry);
  }

  for (const line of evidenceText.split(/\r?\n/)) {
    const cells = rowCells(line);
    const id = cells[0]?.match(/EV-\d{3}/)?.[0];
    if (id && cells.length >= 4) addEvidence(id, plain(cells[1]), plain(cells[2]), line, true);
  }
  for (const section of sections(evidenceText)) {
    const id = section.title.match(/^EV-\d{3}$/)?.[0];
    if (!id) continue;
    const title = section.body.match(/^\*\*(.+?)\*\*/m)?.[1] || id;
    const description = section.body.split(/\r?\n/)
      .filter(line => line.trim() && !/^(?:\||<|\[|!\[)/.test(line.trim())).slice(0, 2).map(plain).join(' ');
    addEvidence(id, title, description, section.body);
  }
  evidenceGroups.sort((a, b) => a.id.localeCompare(b.id));

  const captures = evidenceFiles.filter(file => imagePattern.test(file)).map(file => {
    const associations = evidenceGroups.filter(group => group.files.some(item => item.path === file));
    const fallback = associations.flatMap(group => group.files).find(item => item.path === file);
    const metadata = manifestByPath.get(file);
    if (!fallback && !metadata) recordError(file, 'indexação', 'Captura sem registro no índice ou no manifesto.');
    return { path: file, label: fallback?.label || path.posix.basename(file),
      stage: metadata?.stage || fallback?.stage || 'Etapa não registrada',
      time: metadata?.time || fallback?.time || null, type: 'image',
      evidenceIds: associations.map(group => group.id),
      caseIds: unique([...associations.flatMap(group => group.cases), metadata?.caseId])
    };
  });

  const bugIndex = new Map();
  for (const line of bugText.split(/\r?\n/)) {
    const cells = rowCells(line);
    const id = cells[0]?.match(/BUG-\d{3}/)?.[0];
    if (!id || cells.length < 4) continue;
    const [severity, priority] = plain(cells[2]).split(/\s*\/\s*/);
    bugIndex.set(id, { id, title: plain(cells[1]), severity, priority, status: plain(cells[3]) });
  }
  const bugs = sections(bugText).filter(section => /^BUG-\d{3}$/.test(section.title)).map(section => ({
    ...(bugIndex.get(section.title) || { id: section.title, title: section.title, severity: 'Não registrada', priority: 'Não registrada', status: 'Não registrado' }),
    markdown: section.body,
    relatedCaseIds: cases.filter(item => item.bugIds.includes(section.title)).map(item => item.id)
  }));

  const testSourcePaths = walk('tests').filter(file => /\.[cm]?[jt]sx?$/i.test(file));
  const documentPaths = unique(['README.md', ...walk('docs').filter(file =>
    /\.(?:md|feature)$/i.test(file) && file.toLowerCase() !== 'docs/checklist.md'),
    'package.json', 'playwright.config.ts', ...testSourcePaths,
    ...(fs.existsSync(path.join(projectRoot, 'tests/.gitkeep')) ? ['tests/.gitkeep'] : []),
    ...sourceJsonPaths, ...(hasAutomationRecord ? [automationRecordPath] : [])]);
  const jsonTitles = {
    'ui-capturas.json': 'Manifesto das capturas', 'ui-resultados.json': 'Resultados da interface',
    'ui-complementos.json': 'Complementos da execução da interface', 'capturas.json': 'Manifesto das capturas complementares',
    'api-pendentes.json': 'Execução da API em 07/10', 'exploratoria.json': 'Sessão exploratória EXP-01',
    'api-observacoes-powershell.json': 'Requisições da API em 06/10',
    'api-limite-frete.json': 'API: limite do frete', 'quantidade-seis-api.json': 'API: seis unidades',
    'resultado.json': 'Resultado da automação Playwright'
  };
  const documents = documentPaths.map(file => {
    const content = read(file);
    const basename = path.posix.basename(file);
    const headingTitle = content.match(/^#\s+(.+)\r?$/m)?.[1]?.trim();
    const featureTitle = content.match(/^\s*Funcionalidade:\s*(.+)\r?$/m)?.[1]?.trim();
    const title = (/\.feature$/i.test(file) ? featureTitle || headingTitle : headingTitle || featureTitle)
      || jsonTitles[basename] || (basename === '.gitkeep' ? 'Pasta reservada aos testes Playwright' : basename);
    if (/\.json$/i.test(file)) readJson(file);
    return { path: file, title, type: fileType(file), content };
  });

  function caseSummary(items) {
    return { total: items.length,
      passed: items.filter(item => /^aprovado$/i.test(item.status)).length,
      failed: items.filter(item => /^reprovado$/i.test(item.status)).length,
      blocked: items.filter(item => /^bloqueado$/i.test(item.status)).length,
      notExecuted: items.filter(item => /^n[aã]o executado$/i.test(item.status)).length };
  }
  const totals = caseSummary(cases);
  const testFiles = testSourcePaths.filter(file => /\.spec\.[cm]?[jt]sx?$/i.test(file));
  const notExecuted = /automação[^\n]*(?:não[^\n]*executada|pendente)/i.test(`${execution}\n${readme}`);
  const automationCounts = automationRecord?.summary;
  const automationFields = ['total', 'passed', 'knownFailures', 'unexpectedFailures', 'skipped'];
  const automationStatuses = { passed: 'passed', knownFailures: 'known_failure',
    unexpectedFailures: 'unexpected_failure', skipped: 'skipped' };
  const validAutomationRecord = automationCounts && automationFields.every(field =>
    Number.isInteger(automationCounts[field]) && automationCounts[field] >= 0) &&
    automationCounts.total === automationFields.slice(1).reduce((sum, field) => sum + automationCounts[field], 0) &&
    Array.isArray(automationRecord.tests) && automationRecord.tests.length === automationCounts.total &&
    automationRecord.tests.every(item => /^AUTO-\d{3}$/.test(item?.id) &&
      Object.values(automationStatuses).includes(item.status)) &&
    new Set(automationRecord.tests.map(item => item.id)).size === automationCounts.total &&
    Object.entries(automationStatuses).every(([field, status]) =>
      automationRecord.tests.filter(item => item.status === status).length === automationCounts[field]) &&
    validTimestamp(automationRecord.startedAt) && validTimestamp(automationRecord.finishedAt) &&
    Date.parse(automationRecord.finishedAt) >= Date.parse(automationRecord.startedAt);
  if (hasAutomationRecord && automationRecord && !validAutomationRecord) {
    recordError(automationRecordPath, 'automação', 'O registro não comprova uma execução: confira resumo, testes e horários.');
  }
  const automation = {
    implemented: validAutomationRecord ? automationCounts.total : null,
    executed: validAutomationRecord ? automationCounts.total > 0 : notExecuted ? false : null,
    total: validAutomationRecord ? automationCounts.total : null,
    passed: validAutomationRecord ? automationCounts.passed : null,
    knownFailures: validAutomationRecord ? automationCounts.knownFailures : null,
    unexpectedFailures: validAutomationRecord ? automationCounts.unexpectedFailures : null,
    skipped: validAutomationRecord ? automationCounts.skipped : null,
    required: 3, files: testFiles, specFileCount: testFiles.length,
    status: validAutomationRecord ? 'Execução registrada' : testFiles.length === 0
      ? 'Não implementada; execução pendente' : notExecuted ? 'Implementada; execução pendente' : 'Execução não comprovada',
    recordPath: validAutomationRecord ? automationRecordPath : null,
    startedAt: validAutomationRecord ? automationRecord.startedAt : null,
    finishedAt: validAutomationRecord ? automationRecord.finishedAt : null,
    environment: validAutomationRecord ? automationRecord.environment || null : null
  };
  const automationData = buildAutomationData(projectRoot, { record: automationRecord,
    recordPath: automationRecordPath, validated: validAutomationRecord, base: automation,
    sourceDocuments: documents.filter(document => document.path.startsWith('tests/')), recordError });
  const projectFiles = walk('', new Set(['.git', 'node_modules', 'tmp', 'dashboard', 'playwright-report', 'test-results']));
  const definitionCount = documents.filter(document => document.type === 'gherkin')
    .reduce((sum, document) => sum + [...document.content.matchAll(/^\s*(?:Cenário|Esquema do Cenário|Scenario(?: Outline)?):/gmi)].length, 0);
  const summary = {
    totalCases: totals.total, passed: totals.passed, failed: totals.failed,
    blocked: totals.blocked, notExecuted: totals.notExecuted,
    ui: caseSummary(cases.filter(item => item.layer === 'UI')),
    api: caseSummary(cases.filter(item => item.layer === 'API')),
    groupCount: groups.length, definitionCount, bugCount: bugs.length,
    evidenceGroupCount: evidenceGroups.length, captureCount: captures.length,
    currentCaptureCount: captures.filter(item => manifestByPath.has(item.path)).length,
    documentCount: documents.length, sourceJsonCount: sourceJsonPaths.length,
    fileCount: projectFiles.length, testFileCount: testFiles.length,
    automation
  };

  for (const item of cases) item.description = caseDescriptions[item.id] || groups.find(group => group.id === item.group)?.objective || '';
  const data = { generatedAt: new Date().toISOString(), timeZone: 'America/New_York', summary,
    cases, groups, criteria, evidenceGroups, captures, bugs, documents, errors, automation: automationData,
    caseEvidence: [], explorationEvidence: null };
  const caseEvidenceModule = path.join(__dirname, 'case-evidence.cjs');
  if (fs.existsSync(caseEvidenceModule)) {
    try {
      const { buildCaseEvidence } = require(caseEvidenceModule);
      if (typeof buildCaseEvidence !== 'function') throw new TypeError('buildCaseEvidence indisponível.');
      const packages = buildCaseEvidence(projectRoot, data);
      data.caseEvidence = Array.isArray(packages?.caseEvidence) ? packages.caseEvidence : [];
      data.explorationEvidence = packages?.explorationEvidence || null;
      const packagesById = new Map(data.caseEvidence.map(entry => [entry.caseId, entry]));
      for (const item of cases) item.evidence = packagesById.get(item.id) || null;
      if (Array.isArray(packages?.errors)) errors.push(...packages.errors);
    } catch (error) {
      recordError('dashboard/lib/case-evidence.cjs', 'projeção de evidências', error.message);
    }
  }
  return data;
}

module.exports = { buildData };
