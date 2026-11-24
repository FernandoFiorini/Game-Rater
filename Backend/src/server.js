const app = require('./app');
const env = require('./config/env');

app.listen(env.porta, () => {
  console.log(`API do Game Rater rodando em http://localhost:${env.porta}`);
});
