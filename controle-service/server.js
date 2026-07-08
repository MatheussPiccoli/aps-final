const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(express.json());

const DB_PATH = path.join(__dirname, "config.db");
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY,
            occupied_distance INTEGER,
            read_interval INTEGER,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  db.get("SELECT * FROM config WHERE id = 1", (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO config (id, occupied_distance, read_interval) VALUES (1, 20, 2000)`,
      );
    }
  });
});

// GET /config
app.get("/config", (req, res) => {
  db.get(
    "SELECT occupied_distance as occupiedDistance, read_interval as readInterval FROM config WHERE id = 1",
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    },
  );
});

// PUT /config
app.put("/config", (req, res) => {
  const { occupiedDistance, readInterval } = req.body;
  db.run(
    `UPDATE config SET occupied_distance = ?, read_interval = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
    [occupiedDistance, readInterval],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    },
  );
});

app.listen(3001, () => console.log("Controle Service ativo na porta 3001"));
