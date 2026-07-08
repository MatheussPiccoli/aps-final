import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";

// SUBSTITUA PELO IP DA SUA MÁQUINA ONDE O GATEWAY ESTÁ RODANDO
const GATEWAY_IP = "192.168.5.59";
const API_URL = `http://${GATEWAY_IP}:3000`;

interface LogItem {
  id: number;
  distance: number;
  occupied: boolean;
  createdAt: string;
}

export default function App() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [latest, setLatest] = useState<LogItem | null>(null);
  const [occupiedDistance, setOccupiedDistance] = useState("20");
  const [readInterval, setReadInterval] = useState("2000");

  useEffect(() => {
    loadInitialConfig();

    // Polling ativo para dados em tempo real e histórico
    const interval = setInterval(() => {
      fetchLatestState();
      fetchLogsHistory();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadInitialConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/config`);
      const data = await res.json();
      if (data) {
        setOccupiedDistance(String(data.occupiedDistance));
        setReadInterval(String(data.readInterval));
      }
    } catch (err) {
      console.log("Erro ao carregar configurações básicas:", err);
    }
  };

  const fetchLatestState = async () => {
    try {
      const res = await fetch(`${API_URL}/logs/latest`);
      const data = await res.json();
      setLatest(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLogsHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/logs`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occupiedDistance: parseInt(occupiedDistance, 10),
          readInterval: parseInt(readInterval, 10),
        }),
      });
      const data = await res.json();
      if (data.success) alert("Configurações aplicadas!");
    } catch (err) {
      alert("Erro ao guardar configurações");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Painel de Monitorização</Text>

      {/* Estado Atual */}
      <View style={styles.vagaCard}>
        <Text style={styles.vagaTitle}>Vaga 01</Text>
        <Text
          style={[
            styles.statusBadge,
            { color: latest?.occupied ? "#e74c3c" : "#2ecc71" },
          ]}
        >
          {latest ? (latest.occupied ? "🔴 Ocupada" : "🟢 Livre") : "---"}
        </Text>
        <Text style={styles.subText}>
          Última distância: {latest ? latest.distance : "--"} cm
        </Text>
      </View>

      {/* Formulário de Configuração */}
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Configurações do Sensor</Text>
        <View style={styles.inputGroup}>
          <Text>Distância de Ocupação (cm):</Text>
          <TextInput
            style={styles.input}
            value={occupiedDistance}
            onChangeText={setOccupiedDistance}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text>Intervalo de Leitura (ms):</Text>
          <TextInput
            style={styles.input}
            value={readInterval}
            onChangeText={setReadInterval}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSaveConfig}>
          <Text style={styles.buttonText}>Atualizar Parâmetros</Text>
        </TouchableOpacity>
      </View>

      {/* Histórico */}
      <Text style={styles.historyTitle}>Histórico Recente</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.logLine}>
            <Text style={styles.logTime}>
              {item.createdAt
                ? item.createdAt.split(" ")[1] || item.createdAt
                : ""}
            </Text>
            <Text>{item.distance} cm</Text>
            <Text
              style={{
                fontWeight: "600",
                color: item.occupied ? "#e74c3c" : "#2ecc71",
              }}
            >
              {item.occupied ? "Ocupada" : "Livre"}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 20 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
    color: "#2c3e50",
  },
  vagaCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    marginBottom: 15,
  },
  vagaTitle: { fontSize: 18, color: "#7f8c8d", fontWeight: "600" },
  statusBadge: { fontSize: 26, fontWeight: "bold", marginVertical: 8 },
  subText: { color: "#95a5a6" },
  configCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#34495e",
  },
  inputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 6,
    padding: 6,
    width: 80,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  logLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  logTime: { color: "#7f8c8d" },
});
