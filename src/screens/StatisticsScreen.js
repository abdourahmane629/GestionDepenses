import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpenses } from "../services/api";
import { calculateTotal, formatAmount } from "../utils/helpers";
import { loadCategories } from "../utils/categoryUtils";

const periods = ["Tout", "Aujourd'hui", "Cette semaine", "Ce mois", "Cette année"];

export default function StatisticsScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("Tout");
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem("token");
      const [data, cats] = await Promise.all([
        getExpenses(token),
        loadCategories(),
      ]);
      setExpenses(Array.isArray(data) ? data : []);
      setAllCategories(cats);
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

  const statsByCategory = allCategories.map((cat) => {
    const items = filtered.filter((e) => e.category === cat.label);
    const subtotal = calculateTotal(items);
    const percent = total > 0 ? parseFloat(((subtotal / total) * 100).toFixed(1)) : 0;
    return { ...cat, subtotal, count: items.length, percent };
  }).filter((c) => c.count > 0).sort((a, b) => b.percent - a.percent);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8faf8" }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 20 }}>

        {/* FILTRE PÉRIODE */}
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
              <Text style={{
                color: activePeriod === p ? "#fff" : "#555",
                fontWeight: "600", fontSize: 13,
              }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CARTE TOTAL */}
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

        {/* RÉPARTITION PAR CATÉGORIE */}
        {statsByCategory.length === 0 ? (
          <View style={{
            backgroundColor: "#fff", borderRadius: 20, padding: 50, alignItems: "center",
          }}>
            <Text style={{ color: "#333", fontWeight: "bold", fontSize: 16 }}>Aucune donnée</Text>
            <Text style={{ color: "#999", fontSize: 13, marginTop: 6, textAlign: "center" }}>
              Aucune dépense pour la période sélectionnée
            </Text>
          </View>
        ) : (
          <View>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12, color: "#333" }}>
              Répartition par catégorie
            </Text>
            {statsByCategory.map((cat) => (
              <View key={cat.label} style={{
                backgroundColor: "#fff", borderRadius: 16,
                padding: 15, marginBottom: 10, elevation: 2,
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cat.color }} />
                    <Text style={{ fontWeight: "bold", fontSize: 15 }}>{cat.label}</Text>
                  </View>
                  <Text style={{ color: "#2ecc71", fontWeight: "bold", fontSize: 16 }}>
                    {cat.percent}%
                  </Text>
                </View>

                <Text style={{ color: "#666", marginTop: 4, fontSize: 13 }}>
                  {formatAmount(cat.subtotal)} · {cat.count} dépense{cat.count > 1 ? "s" : ""}
                </Text>

                <View style={{ backgroundColor: "#f0f0f0", borderRadius: 10, height: 10, marginTop: 10 }}>
                  <View style={{
                    backgroundColor: cat.color,
                    width: `${cat.percent}%`,
                    height: 10, borderRadius: 10,
                  }} />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <Text style={{ color: "#999", fontSize: 12 }}>
                    Moy: {formatAmount(Math.round(cat.subtotal / cat.count))}
                  </Text>
                  <Text style={{ color: "#999", fontSize: 12 }}>
                    Max: {formatAmount(Math.max(...filtered
                      .filter((e) => e.category === cat.label)
                      .map((e) => Number(e.amount))))}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}
