'use strict';

const fs = require('node:fs');
const path = require('node:path');
const slash = value => String(value).replace(/\\/g, '/');
const validTime = value => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
  Number.isFinite(Date.parse(value));
const nonnegativeNumber = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const unique = values => [...new Set(values)];

function readableStage(value) {
  const labels = { 'error-context': 'Contexto da falha', 'requisicao-resposta': 'Requisição e resposta',
    'pedido-confirmado': 'Pedido confirmado', '02-frete-gratis-apos-desconto': '2. Frete grátis após o desconto',
    '02-limite-cinco-unidades': '2. Limite de cinco unidades',
    '03-quantidade-recalculada': '3. Quantidade recalculada',
    '02-cep-invalido-rejeitado': '2. CEP inválido rejeitado', '03-cep-corrigido': '3. CEP corrigido' };
  if (labels[value]) return labels[value];
  const stage = String(value || '').replace(/\.\w+$/, '').replace(/^(\d+)-/, '$1. ')
    .replace(/-/g, ' ').trim();
  return stage.replace(/(^|\. )([a-z])/, (_, prefix, first) => prefix + first.toUpperCase());
}

function attachmentType(file, contentType = '') {
  if (/^image\//i.test(contentType) || /\.(?:png|jpe?g|gif|webp|svg)$/i.test(file)) return 'image';
  if (/json/i.test(contentType) || /\.json$/i.test(file)) return 'json';
  if (/markdown/i.test(contentType) || /\.md$/i.test(file)) return 'markdown';
  return 'text';
}

/** Projects one recorded execution without importing or running test sources. */
function buildAutomationData(root, { record, recordPath, validated, sourceDocuments = [], base, recordError }) {
  const counts = ['total', 'passed', 'knownFailures', 'unexpectedFailures', 'skipped'];
  const output = { ...base, summary: Object.fromEntries(counts.map(key => [key, base[key] ?? null])),
    tests: [], durationMs: null, timeZone: record?.timeZone || 'America/New_York', generatedAt: null };
  if (!validated) return output;
  output.durationMs = nonnegativeNumber(record.durationMs) ? record.durationMs
    : Date.parse(record.finishedAt) - Date.parse(record.startedAt);
  output.generatedAt = validTime(record.generatedAt) ? record.generatedAt : null;

  const projectRoot = path.resolve(root);
  const realProjectRoot = fs.realpathSync(projectRoot);
  const executionDirectory = path.posix.dirname(recordPath);
  const issue = (file, message) => recordError(file || recordPath, 'automação', message);
  const stepsPath = path.join(__dirname, 'automation-steps.json');
  let stepRecords = new Map();
  if (fs.existsSync(stepsPath)) {
    try {
      const native = JSON.parse(fs.readFileSync(stepsPath, 'utf8'));
      if (native.schemaVersion !== 1 || native.startedAt !== record.startedAt ||
        native.durationMs !== record.durationMs || !Array.isArray(native.tests)) {
        throw new Error('Os passos pertencem a outra execução.');
      }
      stepRecords = new Map(native.tests.map(test => [test.id, test]));
    } catch (error) { issue('dashboard/lib/automation-steps.json', error.message); }
  }

  function scopedFile(value, directory) {
    if (typeof value !== 'string' || !value.trim()) {
      issue(recordPath, 'Anexo ou registro sem caminho.');
      return null;
    }
    const raw = slash(value.trim());
    const file = path.posix.normalize(raw);
    if (path.win32.isAbsolute(raw) || path.posix.isAbsolute(raw) || /^[a-z][a-z\d+.-]*:/i.test(raw) ||
      !file.startsWith(`${directory}/`)) {
      issue(file, 'Caminho ignorado: deve pertencer à pasta deste teste automatizado.');
      return null;
    }
    try {
      const absolute = path.join(projectRoot, file);
      if (!fs.statSync(absolute).isFile()) throw new Error('não é arquivo');
      const realRelative = slash(path.relative(realProjectRoot, fs.realpathSync(absolute)));
      if (!realRelative.toLowerCase().startsWith(`${directory.toLowerCase()}/`)) {
        issue(file, 'Arquivo ignorado: o destino real fica fora da pasta deste teste.');
        return null;
      }
      return file;
    } catch (error) {
      issue(file, `Não foi possível validar o arquivo (${error.code || error.message}).`);
      return null;
    }
  }

  for (const item of record.tests) {
    const directory = `${executionDirectory}/${item.id}`;
    const fullTitle = String(item.title || item.id);
    const objective = fullTitle.split('|').pop().trim();
    const sourcePaths = sourceDocuments.filter(source => /\.spec\.[cm]?[jt]sx?$/i.test(source.path) &&
      (String(source.content).match(/\bAUTO-\d{3}\b/g) || []).includes(item.id)).map(source => source.path);
    if (!sourcePaths.length) issue(recordPath, `Definição não localizada nas specs atuais: ${item.id}.`);
    const individualPath = scopedFile(`${directory}/registro.json`, directory);
    let ownRecordPath = individualPath;
    if (individualPath) {
      try {
        const individual = JSON.parse(fs.readFileSync(path.join(projectRoot, individualPath), 'utf8').replace(/^\uFEFF/, ''));
        if (individual.id !== item.id) {
          issue(individualPath, 'Registro ignorado: o ID pertence a outro teste.');
          ownRecordPath = null;
        }
      } catch { issue(individualPath, 'Registro individual sem JSON válido.'); ownRecordPath = null; }
    }
    const attachmentMap = new Map();
    for (const attachment of Array.isArray(item.attachments) ? item.attachments : []) {
      const file = scopedFile(attachment?.path, directory);
      if (!file || attachmentMap.has(file)) continue;
      const label = attachment.label || readableStage(attachment.name || path.posix.basename(file));
      const time = attachment.time || attachment.observadoEmUTC || attachment.recordedAtUTC;
      attachmentMap.set(file, { path: file, label,
        type: attachmentType(file, attachment.contentType), stage: attachment.stage || attachment.etapa || label,
        time: validTime(time) ? time : null });
    }
    const native = stepRecords.get(item.id);
    const validSteps = native && native.fullTitle === fullTitle && native.startedAt === item.startedAt &&
      native.durationMs === item.durationMs && native.statusPlaywright === item.statusPlaywright &&
      native.expectedStatus === item.expectedStatus && Array.isArray(native.steps);
    if (native && !validSteps) issue('dashboard/lib/automation-steps.json', `Passos incompatíveis com ${item.id}.`);
    output.tests.push({ id: item.id, title: objective, objective, fullTitle,
      layer: item.layer, ctIds: unique(Array.isArray(item.ctIds) ? item.ctIds : []), status: item.status,
      bugIds: unique(Array.isArray(item.bugIds) ? item.bugIds : []),
      statusPlaywright: item.statusPlaywright || null, expectedStatus: item.expectedStatus || null,
      startedAt: validTime(item.startedAt) ? item.startedAt : null,
      durationMs: nonnegativeNumber(item.durationMs) ? item.durationMs : null,
      errors: (Array.isArray(item.errors) ? item.errors : []).map(error => typeof error === 'string'
        ? error : error?.message || JSON.stringify(error)), attachments: [...attachmentMap.values()],
      steps: validSteps ? native.steps : [],
      recordPath: ownRecordPath, sourcePath: sourcePaths[0] || null, sourcePaths: unique(sourcePaths) });
  }
  return output;
}

module.exports = { buildAutomationData };
