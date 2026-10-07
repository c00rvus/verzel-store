'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CURRENT_UI = 'evidencias/execucao-2026-10-07/ui-resultados.json';
const CURRENT_CAPTURES = 'evidencias/execucao-2026-10-07/ui-capturas.json';
const COMPLEMENTS = 'evidencias/revisao-2026-10-07/ui-complementos.json';
const COMPLEMENT_CAPTURES = 'evidencias/revisao-2026-10-07/capturas.json';
const EXPLORATION = 'evidencias/execucao-2026-10-07/exploratoria.json';
const IMAGE = /\.(?:png|jpe?g|webp|gif)$/i;
const slash = value => String(value).replace(/\\/g, '/');
const unique = values => [...new Set(values.filter(Boolean))];

// These nine historical executions have individual, explicit associations.
// CT-011-UI reuses the CT-008 photo because both assert the same cart state.
const OLD_UI = {
  'CT-002-minusculas': ['evidencias/CT-002-minusculas.png'],
  'CT-002-letras_mistas': ['evidencias/CT-002-letras-mistas.png'],
  'CT-005': ['evidencias/CT-005-remover-reaplicar.png'],
  'CT-006-UI-com-cupom': ['evidencias/revisao-ambiente/frete-subtotal-200-com-cupom.png'],
  'CT-006-UI-sem-cupom': ['evidencias/CT-006-frete-200-sem-cupom.png'],
  'CT-007-UI-jaqueta': ['evidencias/CT-007-jaqueta-com-cupom.png'],
  'CT-007-UI-camiseta-garrafas': ['evidencias/CT-007-subtotal-209-90-com-cupom.png'],
  'CT-008-UI': ['evidencias/CT-008-subtotal-199-90-com-cupom.png'],
  'CT-011-UI': ['evidencias/CT-008-subtotal-199-90-com-cupom.png']
};
const MONTAGE_CASES = new Set(['CT-002-letras_mistas', 'CT-005']);

const RECENT_PREFIXES = {
  'CT-001': ['CT-001-'],
  'CT-002-espacos_inicio': ['CT-002-espacos-inicio-'],
  'CT-002-espacos_fim': ['CT-002-espacos-fim-'],
  'CT-002-letras_e_espacos': ['CT-002-letras-espacos-'],
  'CT-003-UI': ['CT-003-cupom-'], 'CT-004-UI': ['CT-004-cupom-'],
  'CT-009-UI': ['CT-009-quantidade-'],
  'CT-010-aumentar': ['CT-010-aumentar-'],
  'CT-010-diminuir': ['CT-010-diminuir-'],
  'CT-010-adicionar-remover': ['CT-010-adicionar-', 'CT-010-remover-', 'CT-010-vitrine-']
};

function recordsOf(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.resultados)) return value.resultados;
  if (Array.isArray(value?.registros)) return value.registros;
  return value && (value.id || value.caseId) ? [value] : [];
}

function latestByCase(records) {
  const result = new Map();
  for (const record of records) {
    if (!record || typeof (record.caseId || record.id) !== 'string') continue;
    const id = record.caseId || record.id;
    const previous = result.get(id);
    const time = Date.parse(record.observadoEmUTC || record.recordedAtUTC || '');
    const previousTime = Date.parse(previous?.observadoEmUTC || previous?.recordedAtUTC || '');
    if (!previous || !Number.isFinite(previousTime) || (Number.isFinite(time) && time >= previousTime)) result.set(id, record);
  }
  return result;
}

function phaseOf(file, stage) {
  const basename = path.posix.basename(file, path.posix.extname(file)).toLowerCase();
  if (/(?:^|-)antes(?:-|$)/.test(basename)) return 'before';
  if (/(?:^|-)depois(?:-|$)/.test(basename)) return 'after';
  if (/preenchido/.test(basename)) return 'input';
  if (/carrinho-vazio|formulario|vitrine|prepara|pré-condi/i.test(`${basename} ${stage}`)) return 'preparation';
  if (/\bantes\b/i.test(stage)) return 'before';
  if (/\bdepois\b|após/i.test(stage)) return 'after';
  return 'evidence';
}

function makePairs(images) {
  const byAction = new Map();
  for (const image of images) {
    if (!['before', 'after'].includes(image.phase)) continue;
    const stem = path.posix.basename(image.path, path.posix.extname(image.path));
    const key = stem.replace(/(^|-)(?:antes|depois)(?=-|$)/i, '$1PHASE');
    const action = byAction.get(key) || {};
    action[image.phase] = image.path;
    byAction.set(key, action);
  }
  const pairs = [];
  for (const [key, pair] of byAction) {
    if (!pair.before || !pair.after || pair.before === pair.after) continue;
    const label = key.replace(/^CT-\d{3}(?:-UI-\d{2})?-?/, '').replace(/^EXP-\d{2}-?/, '')
      .replace(/PHASE-?/, '').replace(/-/g, ' ').trim();
    pairs.push({ label: label || 'Comparativo da execução', beforePath: pair.before, afterPath: pair.after });
  }
  // Explicitly classified captures can have different names for the same flow.
  if (!pairs.length) {
    const before = images.find(image => image.phase === 'before');
    const after = images.find(image => image.phase === 'after');
    if (before && after && before.path !== after.path) pairs.push({ label: 'Antes e depois da execução', beforePath: before.path, afterPath: after.path });
  }
  return pairs;
}

/** Strict per-case read-only projection; no bulk JSON is attached to a case. */
function buildCaseEvidence(root, data) {
  if (typeof root !== 'string' || !root.trim()) throw new TypeError('Informe a pasta raiz do projeto.');
  if (!Array.isArray(data?.cases)) throw new TypeError('Informe os casos consolidados do projeto.');
  const projectRoot = path.resolve(root);
  const errors = [];
  const captureInfo = new Map((data.captures || []).map(item => [slash(item.path), item]));

  function readJson(file, optional = false) {
    try { return JSON.parse(fs.readFileSync(path.join(projectRoot, file), 'utf8').replace(/^\uFEFF/, '')); }
    catch (error) {
      if (!(optional && error.code === 'ENOENT')) errors.push({ path: file, message: `Não foi possível ler o registro (${error.code || 'JSON inválido'}).` });
      return null;
    }
  }

  function localFile(value, owner) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const input = slash(value);
    if (/^(?:[a-z]+:|\/)/i.test(input)) return null;
    const relative = path.posix.normalize(input.startsWith('evidencias/') ? input : path.posix.join(path.posix.dirname(owner), input));
    if (relative === '..' || relative.startsWith('../')) return null;
    return relative;
  }

  for (const manifestPath of [CURRENT_CAPTURES, COMPLEMENT_CAPTURES]) {
    const manifest = readJson(manifestPath, manifestPath === COMPLEMENT_CAPTURES);
    const rows = Array.isArray(manifest) ? manifest : manifest?.capturas || manifest?.registros || [];
    for (const item of Array.isArray(rows) ? rows : []) {
      const file = localFile(item?.arquivo || item?.path, manifestPath);
      if (!file) continue;
      captureInfo.set(file, { ...(captureInfo.get(file) || {}), path: file,
        label: item.label || item.etapa || item.stage || path.posix.basename(file),
        stage: item.etapa || item.stage || '', time: item.observadoEmUTC || item.time || null });
    }
  }

  const recent = latestByCase(recordsOf(readJson(CURRENT_UI)));
  const complementRecords = recordsOf(readJson(COMPLEMENTS, true)).filter(record => {
    const valid = record && typeof (record.caseId || record.id) === 'string'
      && /^(?:Aprovado|Reprovado|Bloqueado)$/i.test(record.status || '')
      && record.obtido != null && String(record.obtido).trim()
      && Number.isFinite(Date.parse(record.observadoEmUTC || ''));
    if (!valid) errors.push({ path: COMPLEMENTS, message: 'Coleta complementar incompleta ignorada.' });
    return valid;
  });
  const complements = latestByCase(complementRecords);

  function imagesFor(files, owner) {
    const result = [];
    for (const candidate of unique(files.map(file => localFile(file, owner)))) {
      if (!candidate || !IMAGE.test(candidate)) continue;
      if (!fs.existsSync(path.join(projectRoot, candidate))) {
        errors.push({ path: candidate, message: 'Captura declarada, mas arquivo não encontrado.' });
        continue;
      }
      const info = captureInfo.get(candidate) || {};
      const stage = info.stage || path.posix.basename(candidate, path.posix.extname(candidate)).replace(/-/g, ' ');
      result.push({ path: candidate, label: info.label || stage, stage, time: info.time || null,
        phase: phaseOf(candidate, stage) });
    }
    return result.sort((a, b) => (Date.parse(a.time) || 0) - (Date.parse(b.time) || 0));
  }

  function prefixesFor(id) {
    if (RECENT_PREFIXES[id]) return RECENT_PREFIXES[id];
    if (/^CT-012-UI-\d{2}$/.test(id)) return [`${id}-`];
    if (/^CT-013-UI-/.test(id)) return [`${id.replace('-UI-', '-')}-`];
    return [];
  }

  function summaryRecord(item) {
    return { caseId: item.id, group: item.group, layer: item.layer, input: item.input,
      date: item.date, expected: item.expected, actual: item.actual, status: item.status,
      evidenceId: item.evidenceId, bugIds: item.bugIds || [],
      ...(item.originalRecord ? { originalRecord: item.originalRecord } : {}) };
  }

  function packageFor(item) {
    const recordPath = `evidencias/cenarios/${item.id}/registro.json`;
    const record = summaryRecord(item);
    let images = [];
    if (item.layer === 'API') {
      Object.assign(record, { method: item.method ?? null, path: item.path ?? null,
        request: item.request ?? null, response: item.response ?? null, httpStatus: item.httpStatus ?? null,
        sourcePath: item.sourcePath ?? null, sourceId: item.sourceId ?? item.id,
        recordedAtUTC: item.recordedAtUTC ?? null });
    } else {
      const complementary = complements.get(item.id);
      const source = complementary || recent.get(item.id);
      const owner = complementary ? COMPLEMENTS : source ? CURRENT_UI : 'docs/execucao.md';
      let files = [];
      if (source) {
        files = Array.isArray(source.arquivos) ? [...source.arquivos] : [];
        const resolvedFiles = files.map(file => localFile(file, owner)).filter(Boolean);
        const directories = new Set(resolvedFiles.map(file => path.posix.dirname(file)));
        const prefixes = complementary ? [`${item.id}-`] : prefixesFor(item.id);
        for (const file of captureInfo.keys()) {
          if (directories.has(path.posix.dirname(file)) && prefixes.some(prefix => path.posix.basename(file).startsWith(prefix))) files.push(file);
        }
        record.evidenceRecord = { sourcePath: owner, sourceId: source.id || item.id,
          recordedAtUTC: source.observadoEmUTC || source.recordedAtUTC || null,
          dados: source.dados ?? null, esperado: source.esperado ?? null,
          obtido: source.obtido ?? null, status: source.status ?? null,
          arquivos: unique(files.map(file => localFile(file, owner))) };
      } else files = OLD_UI[item.id] || [];
      images = imagesFor(files, owner);
      // Preserve the original consolidated result and source alongside a newer reproduction.
      Object.assign(record, { dados: item.dados ?? null, sourcePath: item.sourcePath || 'docs/execucao.md',
        sourceId: item.sourceId || item.id, recordedAtUTC: item.recordedAtUTC || null });
    }
    const pairs = makePairs(images);
    if (!pairs.length && MONTAGE_CASES.has(item.id) && images.length === 1
        && images[0].path === OLD_UI[item.id]?.[0]) {
      pairs.push({ label: 'Comparativo em montagem', mode: 'montage', montagePath: images[0].path });
    }
    const primary = item.group === 'CT-012'
      ? { before: '-checkout-depois-preencher.png', after: '-pedido-depois-confirmar.png', label: 'Confirmação do pedido' }
      : item.group === 'CT-013'
        ? { before: '-antes-confirmar.png', after: '-depois-confirmar.png', label: 'Validação do campo' }
        : ['CT-001', 'CT-002', 'CT-003', 'CT-004'].includes(item.group)
          ? { before: '-cupom-antes.png', after: '-cupom-depois.png', label: 'Aplicação do cupom' }
          : null;
    if (primary) {
      const before = images.find(image => image.path.endsWith(primary.before));
      const after = images.find(image => image.path.endsWith(primary.after));
      if (before && after) {
        const existing = pairs.findIndex(pair => pair.beforePath === before.path && pair.afterPath === after.path);
        if (existing >= 0) pairs.splice(existing, 1);
        pairs.unshift({ label: primary.label, beforePath: before.path, afterPath: after.path });
      }
    }
    const missing = [];
    const hasEvidence = item.layer === 'API'
      ? Boolean(record.method && record.path && record.httpStatus != null && record.response != null)
      : images.length > 0;
    const hasBeforeAfter = item.layer === 'API' ? null : pairs.length > 0;
    if (!hasEvidence) missing.push(item.layer === 'API' ? 'Registro isolado da requisição e resposta.' : 'Capturas desta execução.');
    if (item.layer !== 'API' && !hasBeforeAfter) missing.push('Capturas separadas antes e depois da ação.');
    return { caseId: item.id, group: item.group, layer: item.layer, images, records: [record], recordPath,
      pairs, coverage: { hasEvidence, hasBeforeAfter, missing } };
  }

  const caseEvidence = data.cases.map(packageFor);
  const exploration = readJson(EXPLORATION);
  let explorationEvidence = null;
  if (exploration?.id === 'EXP-01') {
    const images = imagesFor(Array.isArray(exploration.arquivos) ? exploration.arquivos : [], EXPLORATION);
    const pairs = makePairs(images);
    const missing = images.length ? [] : ['Capturas da sessão exploratória.'];
    explorationEvidence = { caseId: 'EXP-01', group: 'EXP-01', layer: 'Exploratório', images,
      records: [{ caseId: 'EXP-01', sourcePath: EXPLORATION, ...exploration }],
      recordPath: 'evidencias/cenarios/EXP-01/registro.json', pairs,
      coverage: { hasEvidence: images.length > 0, hasBeforeAfter: pairs.length > 0, missing } };
  }
  return { caseEvidence, explorationEvidence, errors };
}

/** Explicit persistence entry point; never called by buildCaseEvidence. */
function saveCaseRecords(root, data) {
  const result = buildCaseEvidence(root, data);
  const projectRoot = path.resolve(root);
  const written = [];
  const errors = [...result.errors];
  for (const item of [...result.caseEvidence, ...(result.explorationEvidence ? [result.explorationEvidence] : [])]) {
    if (!/^(?:CT-\d{3}(?:-[A-Za-z0-9_]+)*|EXP-\d{2})$/.test(item.caseId)) {
      errors.push({ path: item.recordPath, message: 'ID de caso inválido para salvar o registro.' });
      continue;
    }
    const target = path.resolve(projectRoot, item.recordPath);
    const relative = path.relative(projectRoot, target);
    if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
      errors.push({ path: item.recordPath, message: 'Destino fora do projeto recusado.' });
      continue;
    }
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, `${JSON.stringify({ ...item.records[0], images: item.images, pairs: item.pairs }, null, 2)}\n`, 'utf8');
      written.push(item.recordPath);
    } catch (error) {
      errors.push({ path: item.recordPath, message: `Não foi possível salvar o registro (${error.code || 'erro de escrita'}).` });
    }
  }
  return { written, errors };
}

module.exports = { buildCaseEvidence, saveCaseRecords };
