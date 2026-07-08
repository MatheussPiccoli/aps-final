const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const CONTROLE_SERVICE_URL = "http://localhost:3001";
const LOGGING_SERVICE_URL = "http://localhost:3002";

app.get("/config", async (req, res) => {
  try {
    const response = await axios.get(`${CONTROLE_SERVICE_URL}/config`);
    res.json(response.data);
  } catch (error) {
    res.status(502).json({ error: "Controle Service indisponível" });
  }
});

app.put("/config", async (req, res) => {
  try {
    const response = await axios.put(
      `${CONTROLE_SERVICE_URL}/config`,
      req.body,
    );
    res.json(response.data);
  } catch (error) {
    res.status(502).json({ error: "Erro ao comunicar com o Controle Service" });
  }
});

app.post("/logs", async (req, res) => {
  try {
    const response = await axios.post(`${LOGGING_SERVICE_URL}/logs`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(502).json({ error: "Erro ao comunicar com o Logging Service" });
  }
});

app.get("/logs", async (req, res) => {
  try {
    const response = await axios.get(`${LOGGING_SERVICE_URL}/logs`);
    res.json(response.data);
  } catch (error) {
    res.status(502).json({ error: "Logging Service indisponível" });
  }
});

app.get("/logs/latest", async (req, res) => {
  try {
    const response = await axios.get(`${LOGGING_SERVICE_URL}/logs/latest`);
    res.json(response.data);
  } catch (error) {
    res.status(502).json({ error: "Logging Service indisponível" });
  }
});

app.listen(3000, "0.0.0.0", () =>
  console.log("API Gateway ativo na porta 3000"),
);
