// backend/db.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Exportăm atât metoda 'query' pentru interogări simple,
// cât și 'pool'-ul pentru tranzacții complexe.
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool, // Această linie a fost adăugată
};
