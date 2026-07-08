const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(express.json());

const DB_PATH = path.join(__dirname, "logs.db");
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            distance INTEGER,
            occupied BOOLEAN,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// POST /logs
app.post("/logs", (req, res) => {
  const { distance, occupied } = req.body;
  db.run(
    `INSERT INTO logs (distance, occupied) VALUES (?, ?)`,
    [distance, occupied ? 1 : 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    },
  );
});

// GET /logs
app.get("/logs", (req, res) => {
  db.all(
    "SELECT id, distance, occupied, created_at as createdAt FROM logs ORDER BY created_at DESC LIMIT 50",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const formatted = rows.map((r) => ({ ...r, occupied: !!r.occupied }));
      res.json(formatted);
    },
  );
});

// GET /logs/latest
app.get("/logs/latest", (req, res) => {
  db.get(
    "SELECT distance, occupied, created_at as createdAt FROM logs ORDER BY created_at DESC LIMIT 1",
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.json(null);
      res.json({ ...row, occupied: !!row.occupied });
    },
  );
});

app.listen(3002, () => console.log("Logging Service ativo na porta 3002"));
