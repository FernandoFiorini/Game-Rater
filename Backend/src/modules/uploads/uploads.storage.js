const fs = require('node:fs/promises');
const path = require('node:path');
const env = require('../../config/env');

const PREFIXO = '/uploads/';

/** Apaga do disco os arquivos locais (/uploads/...) da lista. Ignora URLs externas. */
async function removerArquivosLocais(urls) {
  const locais = urls.filter((u) => typeof u === 'string' && u.startsWith(PREFIXO));
  await Promise.all(
    locais.map(async (url) => {
      const nome = path.basename(url); // evita path traversal
      try {
        await fs.unlink(path.join(env.uploadsDir, nome));
      } catch (erro) {
        if (erro.code !== 'ENOENT') console.warn(`Não foi possível remover ${nome}:`, erro.message);
      }
    }),
  );
}

module.exports = { PREFIXO, removerArquivosLocais };
