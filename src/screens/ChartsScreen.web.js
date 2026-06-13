import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpenses } from "../services/api";
import { calculateTotal, formatAmount, CATEGORIES } from "../utils/helpers";
import { VictoryPie, VictoryBar, VictoryChart, VictoryTheme } from "victory";

const periods = ["Tout", "Aujourd'hui", "Cette semaine", "Ce mois", "Cette année"];

export default function ChartsScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("Tout");

  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem("token");
      const data = await getExpenses(token);
      setExpenses(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  const filterByPeriod = (list) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (activePeriod === "Aujourd'hui") {
      return list.filter((e) => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === now.getTime();
      });
    }
    if (activePeriod === "Cette semaine") {
      const start = new Date(now);
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
      start.setDate(now.getDate() - day);
      return list.filter((e) => new Date(e.date) >= start);
    }
    if (activePeriod === "Ce mois") {
      return list.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (activePeriod === "Cette année") {
      return list.filter((e) => new Date(e.date).getFullYear() === now.getFullYear());
    }
    return list;
  };

  const filtered = filterByPeriod(expenses);
  const total = calculateTotal(filtered);

  const catData = CATEGORIES.map((cat) => ({
    ...cat,
    catTotal: calculateTotal(filtered.filter((e) => e.category === cat.label)),
  })).filter((c) => c.catTotal > 0);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8faf8" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8faf8" }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 20 }}>

        <Text style={{
          fontWeight: "700", fontSize: 12, color: "#888",
          textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
        }}>
          Période
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setActivePeriod(p)}
              style={{
                backgroundColor: activePeriod === p ? "#1a1a2e" : "#fff",
                borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                elevation: 1, borderWidth: activePeriod === p ? 0 : 1, borderColor: "#eee",
              }}
            >
              <Text style={{ color: activePeriod === p ? "#fff" : "#555", fontWeight: "600", fontSize: 13 }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{
          backgroundColor: "#2ecc71", borderRadius: 20,
          padding: 20, marginBottom: 20,
        }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            Total {activePeriod !== "Tout" ? `· ${activePeriod}` : "des dépenses"}
          </Text>
          <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold", marginTop: 4 }}>
            {formatAmount(total)}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 4, fontSize: 13 }}>
            {filtered.length} transaction{filtered.length > 1 ? "s" : ""}
          </Text>
        </View>

        {total === 0 ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 50, alignItems: "center" }}>
            <Text style={{ color: "#333", fontWeight: "bold", fontSize: 16 }}>Aucune donnée</Text>
            <Text style={{ color: "#999", fontSize: 13, marginTop: 6, textAlign: "center" }}>
              Aucune dépense pour la période sélectionnée
            </Text>
          </View>
        ) : (
          <View>
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2 }}>
              <Text style={{ fontWeight: "bold", fontSize: 15, color: "#333", marginBottom: 8 }}>
                Répartition par catégorie
              </Text>
              <VictoryPie
                data={catData.map((c) => ({ x: c.label, y: c.catTotal }))}
                width={340} height={280}
                colorScale={catData.map((c) => c.color)}
                innerRadius={60}
                labelRadius={95}
                style={{ labels: { fontSize: 10, fontWeight: "bold" } }}
              />
            </View>

            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 20, elevation: 2 }}>
              <Text style={{ fontWeight: "bold", fontSize: 15, color: "#333", marginBottom: 8 }}>
                Montants par catégorie
              </Text>
              <VictoryChart width={340} theme={VictoryTheme.material} domainPadding={20}>
                <VictoryBar
                  data={catData.map((c) => ({ x: c.label, y: c.catTotal }))}
                  style={{ data: { fill: "#2ecc71" } }}
                />
              </VictoryChart>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}
