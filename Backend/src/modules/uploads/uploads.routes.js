const { Router } = require('express');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');
const env = require('../../config/env');
const { HttpError } = require('../../utils/http-error');
const { PREFIXO } = require('./uploads.storage');

fs.mkdirSync(env.uploadsDir, { recursive: true });

const EXTENSOES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif' };

const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadsDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSOES[file.mimetype]}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (EXTENSOES[file.mimetype]) cb(null, true);
    else cb(HttpError.requisicaoInvalida('Formato não suportado. Use JPG, PNG, WEBP, GIF ou AVIF.'));
  },
});

const router = Router();

// TODO(auth): proteger com middleware de admin.
router.post('/', upload.array('arquivos', 10), (req, res) => {
  const arquivos = /** @type {Express.Multer.File[]} */ (req.files || []);
  if (!arquivos.length) throw HttpError.requisicaoInvalida('Nenhum arquivo enviado');
  res.status(201).json(arquivos.map((a) => ({ url: PREFIXO + path.basename(a.filename) })));
});

module.exports = router;
