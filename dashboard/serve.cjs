'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const HOST = '127.0.0.1';
const root = path.resolve(__dirname, 'dist');
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.feature': 'text/plain; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml; charset=utf-8',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm'
};

function within(base, filename) {
  const relative = path.relative(base, filename);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' &&
    !relative.startsWith(`..${path.sep}`));
}

function errorResponse(request, response, status, message) {
  const body = Buffer.from(JSON.stringify({ error: message }), 'utf8');
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length });
  response.end(request.method === 'HEAD' ? undefined : body);
}

function createServer() {
  return http.createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD');
      errorResponse(request, response, 405, 'Método não permitido.');
      return;
    }
    let relative;
    try {
      const pathname = decodeURIComponent((request.url || '/').split('?')[0]);
      if (!pathname.startsWith('/') || pathname.includes('\0') || pathname.includes('\\') || pathname.includes(':')) throw new Error();
      relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      if (relative.split('/').some(segment => !segment || segment === '.' || segment === '..')) throw new Error();
    } catch {
      errorResponse(request, response, 400, 'Caminho inválido.');
      return;
    }
    try {
      const filename = path.resolve(root, relative);
      if (!within(root, filename)) {
        errorResponse(request, response, 403, 'Arquivo fora do dashboard.');
        return;
      }
      const [realRoot, realFile] = await Promise.all([fs.promises.realpath(root), fs.promises.realpath(filename)]);
      if (!within(realRoot, realFile)) {
        errorResponse(request, response, 403, 'Arquivo fora do dashboard.');
        return;
      }
      const stat = await fs.promises.stat(realFile);
      if (!stat.isFile()) {
        errorResponse(request, response, 404, 'Arquivo não encontrado.');
        return;
      }
      response.writeHead(200, {
        'Content-Type': types[path.extname(realFile).toLowerCase()] || 'application/octet-stream',
        'Content-Length': stat.size
      });
      if (request.method === 'HEAD') { response.end(); return; }
      const stream = fs.createReadStream(realFile);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    } catch (error) {
      if (response.headersSent) { response.destroy(); return; }
      const missing = error.code === 'ENOENT' || error.code === 'ENOTDIR';
      errorResponse(request, response, missing ? 404 : 500,
        missing ? 'Arquivo não encontrado. Execute o build.' : 'Não foi possível ler o arquivo.');
    }
  });
}

function startServer() {
  const input = process.env.DASHBOARD_PORT || '4174';
  const port = Number(input);
  if (!/^\d+$/.test(input) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DASHBOARD_PORT deve ser uma porta entre 1 e 65535.');
  }
  const server = createServer();
  server.listen(port, HOST, () => console.log(`Preview: http://${HOST}:${port}/`));
  return server;
}

module.exports = { createServer, startServer };
if (require.main === module) {
  try {
    const server = startServer();
    server.on('error', error => { console.error(`Preview: ${error.code || 'erro ao iniciar'}.`); process.exitCode = 1; });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
