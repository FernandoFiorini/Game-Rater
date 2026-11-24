const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { errorHandler } = require('./middlewares/error-handler');

const app = express();

app.use(cors({ origin: env.corsOrigem }));
app.use(express.json({ limit: '1mb' }));

app.use('/uploads', express.static(env.uploadsDir, { maxAge: '30d', immutable: true }));

app.get('/api/saude', (_req, res) => res.json({ ok: true }));
app.use('/api/lookups', require('./modules/lookups/lookups.routes'));
app.use('/api/jogos', require('./modules/jogos/jogos.routes'));
app.use('/api/externo', require('./modules/externo/externo.routes'));
app.use('/api/uploads', require('./modules/uploads/uploads.routes'));
app.use('/api/estatisticas', require('./modules/estatisticas/estatisticas.routes'));

app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
app.use(errorHandler);

module.exports = app;
