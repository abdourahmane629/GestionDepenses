import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View, Text, ScrollView, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllUsers, getExpenses } from "../services/api";
import { TouchableOpacity } from "react-native";
import { formatAmount, CATEGORIES } from "../utils/helpers";

export default function AdminScreen({ navigation, onLogout }) {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 15, marginRight: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate("AdminUtilisateurs")}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Utilisateurs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AdminGraphiques")}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Graphiques</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, onLogout]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const [usersData, expensesData] = await Promise.all([
        getAllUsers(token),
        getExpenses(token),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setLoading(false);
    };
    load();
  }, []);

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f0f4f0" }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 15 }}>

        {/* Cartes globales */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
          <View style={{ flex: 1, backgroundColor: "#2ecc71", borderRadius: 16, padding: 16 }}>
            <Text style={{ color: "#fff", fontSize: 12, opacity: 0.9 }}>Utilisateurs</Text>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
              {users.length}
            </Text>
            <Text style={{ color: "#fff", opacity: 0.8, fontSize: 12 }}>
              {users.filter((u) => u.statut === "bloque").length} bloqué(s)
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#27ae60", borderRadius: 16, padding: 16 }}>
            <Text style={{ color: "#fff", fontSize: 12, opacity: 0.9 }}>Total dépenses</Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold" }}>
              {formatAmount(totalAmount)}
            </Text>
            <Text style={{ color: "#fff", opacity: 0.8, fontSize: 12 }}>
              {expenses.length} transactions
            </Text>
          </View>
        </View>

        {/* Stats par catégorie */}
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10, color: "#333" }}>
          Dépenses par catégorie
        </Text>
        {[...CATEGORIES]
          .map((cat) => {
            const catExpenses = expenses.filter((e) => e.category === cat.label);
            const catTotal = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
            const percent = totalAmount > 0 ? ((catTotal / totalAmount) * 100).toFixed(1) : 0;
            return { ...cat, catExpenses, catTotal, percent };
          })
          .filter((c) => c.catExpenses.length > 0)
          .sort((a, b) => b.catTotal - a.catTotal)
          .map((cat) => (
            <View key={cat.label} style={{
              backgroundColor: "#fff", borderRadius: 14,
              padding: 14, marginBottom: 8, elevation: 1,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "bold" }}>{cat.label}</Text>
                <Text style={{ color: "#2ecc71", fontWeight: "bold" }}>{cat.percent}%</Text>
              </View>
              <Text style={{ color: "#666", fontSize: 13, marginTop: 2 }}>
                {formatAmount(cat.catTotal)} · {cat.catExpenses.length} dépense{cat.catExpenses.length > 1 ? "s" : ""}
              </Text>
              <View style={{ backgroundColor: "#f0f0f0", borderRadius: 10, height: 6, marginTop: 8 }}>
                <View style={{ backgroundColor: cat.color, width: `${cat.percent}%`, height: 6, borderRadius: 10 }} />
              </View>
            </View>
          ))
        }

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}
