const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const axios = require("axios");

// ==========================================
// BANCO DE DADOS (SQLite em memória/arquivo)
// ==========================================
const dbConfig = new sqlite3.Database("./config.db");
const dbLogs = new sqlite3.Database("./logs.db");

dbConfig.serialize(() => {
  dbConfig.run(
    `CREATE TABLE IF NOT EXISTS Config (id INTEGER PRIMARY KEY, occupied_distance INTEGER, read_interval INTEGER)`,
  );
  // Insere configuração inicial se não existir
  dbConfig.get("SELECT * FROM Config", (err, row) => {
    if (!row)
      dbConfig.run(
        `INSERT INTO Config (occupied_distance, read_interval) VALUES (20, 2000)`,
      );
  });
});

dbLogs.serialize(() => {
  dbLogs.run(
    `CREATE TABLE IF NOT EXISTS Leituras (id INTEGER PRIMARY KEY AUTOINCREMENT, distance INTEGER, occupied BOOLEAN, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  );
});

// ==========================================
// MICROSERVIÇO: CONTROLE (Porta 3001)
// ==========================================
const appControle = express();
appControle.use(express.json());

appControle.get("/config", (req, res) => {
  dbConfig.get(
    "SELECT occupied_distance as occupiedDistance, read_interval as readInterval FROM Config WHERE id = 1",
    (err, row) => {
      res.json(row);
    },
  );
});

appControle.put("/config", (req, res) => {
  const { occupiedDistance, readInterval } = req.body;
  dbConfig.run(
    `UPDATE Config SET occupied_distance = ?, read_interval = ? WHERE id = 1`,
    [occupiedDistance, readInterval],
    function (err) {
      res.json({ success: true });
    },
  );
});
appControle.listen(3001, () =>
  console.log("Microserviço Controle rodando na porta 3001"),
);

// ==========================================
// MICROSERVIÇO: LOGGING (Porta 3002)
// ==========================================
const appLogging = express();
appLogging.use(express.json());

appLogging.post("/logs", (req, res) => {
  const { distance, occupied } = req.body;
  dbLogs.run(
    `INSERT INTO Leituras (distance, occupied) VALUES (?, ?)`,
    [distance, occupied],
    function (err) {
      res.json({ id: this.lastID });
    },
  );
});

appLogging.get("/logs", (req, res) => {
  dbLogs.all(
    "SELECT * FROM Leituras ORDER BY created_at DESC LIMIT 20",
    (err, rows) => {
      res.json(rows);
    },
  );
});
appLogging.listen(3002, () =>
  console.log("Microserviço Logging rodando na porta 3002"),
);

// ==========================================
// API GATEWAY (Porta 3000)
// ==========================================
const appGateway = express();
appGateway.use(cors());
appGateway.use(express.json());

// Rotas repassadas para o Controle
appGateway.get("/api/config", async (req, res) => {
  const response = await axios.get("http://localhost:3001/config");
  res.json(response.data);
});
appGateway.put("/api/config", async (req, res) => {
  const response = await axios.put("http://localhost:3001/config", req.body);
  res.json(response.data);
});

// Rotas repassadas para o Logging
appGateway.get("/api/logs", async (req, res) => {
  const response = await axios.get("http://localhost:3002/logs");
  res.json(response.data);
});
appGateway.post("/api/logs", async (req, res) => {
  const response = await axios.post("http://localhost:3002/logs", req.body);
  res.json(response.data);
});

appGateway.listen(3000, "0.0.0.0", () =>
  console.log("API Gateway rodando na porta 3000"),
);
