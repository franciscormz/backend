const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "root",
  database: "transporte",
  port: 5432,
  max: 50,
});

pool.on("connect", () => {
  console.log("✅ Conectado a PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Error en PostgreSQL", err);
});

module.exports = pool;