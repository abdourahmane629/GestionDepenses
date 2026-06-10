import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Modal, useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllUsers, getExpenses } from "../services/api";
import { formatAmount } from "../utils/helpers";
import { loadCategories } from "../utils/categoryUtils";

export default function AdminScreen({ navigation, onLogout }) {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: isMobile ? () => (
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={{ marginLeft: 14, padding: 4 }}
        >
          <View style={{ gap: 5 }}>
            <View style={{ width: 22, height: 2, backgroundColor: "#fff", borderRadius: 2 }} />
            <View style={{ width: 22, height: 2, backgroundColor: "#fff", borderRadius: 2 }} />
            <View style={{ width: 22, height: 2, backgroundColor: "#fff", borderRadius: 2 }} />
          </View>
        </TouchableOpacity>
      ) : undefined,
      headerRight: !isMobile ? () => (
        <View style={{ flexDirection: "row", gap: 15, marginRight: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate("AdminUtilisateurs")}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Utilisateurs</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AdminGraphiques")}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Graphiques</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AdminCategories")}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Catégories</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      ) : undefined,
    });
  }, [navigation, onLogout, isMobile]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const [usersData, expensesData, cats] = await Promise.all([
        getAllUsers(token),
        getExpenses(token),
        loadCategories(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setAllCategories(cats);
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
    <View style={{ flex: 1, backgroundColor: "#f0f4f0" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 15 }}>

          {/* Cartes globales */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
            <View style={{ flex: 1, backgroundColor: "#2ecc71", borderRadius: 16, padding: 16 }}>
              <Text style={{ color: "#fff", fontSize: 12, opacity: 0.9 }}>Utilisateurs</Text>
              <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>{users.length}</Text>
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
          {[...new Map(allCategories.map((cat) => [cat.label, cat])).values()]
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

      {/* DRAWER MENU — mobile */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setDrawerOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={{
              width: 285,
              height: "100%",
              backgroundColor: "#fff",
              elevation: 24,
              shadowColor: "#000",
              shadowOffset: { width: 6, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              overflow: "hidden",
            }}>

              {/* ── En-tête vert avec icône admin ── */}
              <View style={{
                backgroundColor: "#1a1a2e",
                paddingTop: 56,
                paddingBottom: 28,
                paddingHorizontal: 24,
              }}>
                <View style={{
                  width: 58, height: 58, borderRadius: 29,
                  backgroundColor: "rgba(46,204,113,0.25)",
                  alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                  borderWidth: 2, borderColor: "rgba(46,204,113,0.5)",
                }}>
                  <Text style={{ fontSize: 24 }}>🛡️</Text>
                </View>
                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#fff", marginBottom: 3 }}>
                  Panel Admin
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  Gestion de l'application
                </Text>
              </View>

              {/* ── Items de navigation ── */}
              <View style={{ flex: 1, paddingTop: 12, paddingHorizontal: 16 }}>
                {[
                  { icon: "👥", label: "Utilisateurs", onPress: () => navigation.navigate("AdminUtilisateurs") },
                  { icon: "📊", label: "Graphiques",   onPress: () => navigation.navigate("AdminGraphiques") },
                  { icon: "🏷️", label: "Catégories",   onPress: () => navigation.navigate("AdminCategories") },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => { setDrawerOpen(false); item.onPress(); }}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 14,
                      paddingVertical: 14, paddingHorizontal: 12,
                      borderRadius: 14, marginBottom: 4,
                    }}
                  >
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: "#f0fdf4",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    </View>
                    <Text style={{ fontSize: 15, color: "#1a1a2e", fontWeight: "600" }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Bouton Déconnexion en bas ── */}
              <View style={{ paddingHorizontal: 16, paddingBottom: 36, paddingTop: 8 }}>
                <View style={{ height: 1, backgroundColor: "#f0f0f0", marginBottom: 16 }} />
                <TouchableOpacity
                  onPress={() => { setDrawerOpen(false); onLogout(); }}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 14,
                    paddingVertical: 14, paddingHorizontal: 16,
                    backgroundColor: "#fff0f0", borderRadius: 14,
                  }}
                >
                  <View style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: "#ffe0e0",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 18 }}>🚪</Text>
                  </View>
                  <Text style={{ fontSize: 15, color: "#e74c3c", fontWeight: "700" }}>
                    Déconnexion
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
