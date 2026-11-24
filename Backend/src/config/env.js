const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  porta: Number(process.env.PORT) || 3000,
  corsOrigem: process.env.CORS_ORIGIN || 'http://localhost:4200',

  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT) || 5432,
  },

  // IGDB usa as credenciais de um app da Twitch: https://dev.twitch.tv/console/apps
  igdb: {
    clientId: process.env.IGDB_CLIENT_ID || '',
    clientSecret: process.env.IGDB_CLIENT_SECRET || '',
  },

  // https://rawg.io/apidocs
  rawg: {
    apiKey: process.env.RAWG_API_KEY || '',
  },

  uploadsDir: path.resolve(__dirname, '../../uploads'),
};

module.exports = env;
