import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TextInput,
  Button,
  FlatList,
} from "react-native";

const API_URL = "http://SEU_IP_AQUI:3000/api";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({
    occupiedDistance: "20",
    readInterval: "2000",
  });
  const [isOccupied, setIsOccupied] = useState(false);
  const [lastDistance, setLastDistance] = useState("--");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Atualiza os logs a cada 3s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Busca logs
      const logsRes = await fetch(`${API_URL}/logs`);
      const logsData = await logsRes.json();
      setLogs(logsData);

      if (logsData.length > 0) {
        setIsOccupied(logsData[0].occupied === 1);
        setLastDistance(logsData[0].distance);
      }

      // Busca configs
      const configRes = await fetch(`${API_URL}/config`);
      const configData = await configRes.json();
      setConfig({
        occupiedDistance: String(configData.occupiedDistance),
        readInterval: String(configData.readInterval),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const saveConfig = async () => {
    await fetch(`${API_URL}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        occupiedDistance: parseInt(config.occupiedDistance),
        readInterval: parseInt(config.readInterval),
      }),
    });
    alert("Configuração salva com sucesso!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vaga 01</Text>
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          {isOccupied ? "🔴 Ocupada" : "🟢 Livre"}
        </Text>
        <Text>Última distância: {lastDistance} cm</Text>
      </View>

      <Text style={styles.subtitle}>Configuração da Vaga</Text>
      <View style={styles.inputContainer}>
        <Text>Distância Crítica (cm):</Text>
        <TextInput
          style={styles.input}
          value={config.occupiedDistance}
          onChangeText={(text) =>
            setConfig({ ...config, occupiedDistance: text })
          }
          keyboardType="numeric"
        />
      </View>
      <Button title="Salvar Configuração" onPress={saveConfig} />

      <Text style={styles.subtitle}>Histórico de Leituras</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text>{new Date(item.created_at).toLocaleTimeString()}</Text>
            <Text>{item.distance} cm</Text>
            <Text>{item.occupied ? "Ocupada" : "Livre"}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 40, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  statusBox: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    width: 80,
    borderRadius: 5,
  },
  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});
