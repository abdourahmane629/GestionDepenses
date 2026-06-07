import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpenses } from "../services/api";
import { calculateTotal, formatAmount, CATEGORIES } from "../utils/helpers";

export default function StatisticsScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem("token");
      const data = await getExpenses(token);
      setExpenses(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    load();
  }, []);

  const total = calculateTotal(expenses);

  const statsByCategory = CATEGORIES.map((cat) => {
    const items = expenses.filter((e) => e.category === cat.label);
    const subtotal = calculateTotal(items);
    const percent = total > 0 ? parseFloat(((subtotal / total) * 100).toFixed(1)) : 0;
    return { ...cat, subtotal, count: items.length, percent };
  }).filter((c) => c.count > 0);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>

      {/* Total */}
      <View style={{
        backgroundColor: "#2ecc71", margin: 15,
        borderRadius: 20, padding: 20,
      }}>
        <Text style={{ color: "#fff", fontSize: 14 }}>Total général</Text>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
          {formatAmount(total)}
        </Text>
        <Text style={{ color: "#fff", opacity: 0.8 }}>
          {expenses.length} transaction{expenses.length > 1 ? "s" : ""}
        </Text>
      </View>

      {/* Barres par catégorie */}
      {statsByCategory.length === 0 ? (
        <View style={{ alignItems: "center", padding: 40 }}>
          <Text style={{ color: "#999", fontSize: 16 }}>
            Aucune dépense enregistrée
          </Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 15 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12, color: "#333" }}>
            Répartition par catégorie
          </Text>
          {statsByCategory.map((cat) => (
            <View key={cat.label} style={{
              backgroundColor: "#fff", borderRadius: 16,
              padding: 15, marginBottom: 10, elevation: 2,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                  {cat.label}
                </Text>
                <Text style={{ color: "#2ecc71", fontWeight: "bold", fontSize: 16 }}>
                  {cat.percent}%
                </Text>
              </View>

              <Text style={{ color: "#666", marginTop: 4, fontSize: 13 }}>
                {formatAmount(cat.subtotal)} · {cat.count} dépense{cat.count > 1 ? "s" : ""}
              </Text>

              {/* Barre de progression */}
              <View style={{
                backgroundColor: "#f0f0f0", borderRadius: 10,
                height: 10, marginTop: 10,
              }}>
                <View style={{
                  backgroundColor: cat.color,
                  width: `${cat.percent}%`,
                  height: 10, borderRadius: 10,
                }} />
              </View>

              {/* Mini stats */}
              <View style={{
                flexDirection: "row", justifyContent: "space-between",
                marginTop: 8,
              }}>
                <Text style={{ color: "#999", fontSize: 12 }}>
                  Moy: {formatAmount(Math.round(cat.subtotal / cat.count))}
                </Text>
                <Text style={{ color: "#999", fontSize: 12 }}>
                  Max: {formatAmount(Math.max(...expenses
                    .filter((e) => e.category === cat.label)
                    .map((e) => Number(e.amount))))}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}