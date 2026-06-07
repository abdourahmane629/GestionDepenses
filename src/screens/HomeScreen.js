import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  Platform, ScrollView, TextInput, useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpenses, deleteExpenseAPI } from "../services/api";
import CategoryBadge from "../components/CategoryBadge";
import { formatAmount, formatDate, calculateTotal, CATEGORIES } from "../utils/helpers";

export default function HomeScreen({ navigation, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [activePeriod, setActivePeriod] = useState("Tout");
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Header simplifié — juste déconnexion sur mobile
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: isMobile ? 8 : 15, marginRight: 10 }}>
          {!isMobile && (
            <>
              <TouchableOpacity onPress={() => navigation.navigate("AjouterDepense")}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>+ Nouvelle</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Graphiques")}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Graphiques</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Statistiques")}>
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Stats</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={onLogout}>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
              {isMobile ? "⏻" : "Déconnexion"}
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, onLogout, isMobile]);

  useEffect(() => {
    const load = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      const token = await AsyncStorage.getItem("token");
      const data = await getExpenses(token);
      setExpenses(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    const unsubscribe = navigation.addListener("focus", load);
    return unsubscribe;
  }, [navigation]);

  // Réinitialiser le filtre catégorie quand la période change
  useEffect(() => {
    setActiveFilter("Tout");
  }, [activePeriod]);

  const handleDelete = async (expense) => {
    const ok = Platform.OS === "web"
      ? window.confirm(`Supprimer "${expense.title}" ?`)
      : true;
    if (!ok) return;
    const token = await AsyncStorage.getItem("token");
    await deleteExpenseAPI(token, expense.id);
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
  };

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
      // Semaine commence le lundi (convention française)
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

  const periods = ["Tout", "Aujourd'hui", "Cette semaine", "Ce mois", "Cette année"];

  const periodFiltered = filterByPeriod(expenses);

  // Seulement les catégories présentes dans la période sélectionnée
  const availableCategories = CATEGORIES.filter((cat) =>
    periodFiltered.some((e) => e.category === cat.label)
  );

  const filtered = periodFiltered.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "Tout" || item.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const total = calculateTotal(filtered);
  const thisMonth = calculateTotal(expenses.filter((e) => {
    const d = new Date(e.date), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }));
  const avgExpense = filtered.length > 0 ? total / filtered.length : 0;
  const topCategory = [...CATEGORIES].map((cat) => ({
    ...cat, total: calculateTotal(periodFiltered.filter((e) => e.category === cat.label)),
  })).sort((a, b) => b.total - a.total)[0];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8faf8" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8faf8" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO HEADER */}
        <View style={{
          backgroundColor: "#2ecc71",
          paddingTop: 20, paddingBottom: 40,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 4 }}>
            Bonjour, {user?.nom || "Utilisateur"}
          </Text>
          <Text style={{ color: "#fff", fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </Text>

          <View style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 20, padding: 20, marginBottom: 16,
          }}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
              Total {activePeriod !== "Tout" ? `· ${activePeriod}` : "des dépenses"}
            </Text>
            <Text style={{ color: "#fff", fontSize: 38, fontWeight: "bold", marginTop: 4 }}>
              {formatAmount(total)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <View style={{
                backgroundColor: "rgba(255,255,255,0.25)",
                borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3,
              }}>
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  {filtered.length} transaction{filtered.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Ce mois</Text>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16, marginTop: 4 }}>
                {formatAmount(thisMonth)}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Moyenne</Text>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16, marginTop: 4 }}>
                {formatAmount(Math.round(avgExpense))}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 }}>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Top</Text>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13, marginTop: 4 }}>
                {topCategory?.total > 0 ? topCategory.label : "—"}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 20 }}>

          {/* FILTRE PAR PÉRIODE */}
          <Text style={{ fontWeight: "700", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
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

          {/* RECHERCHE */}
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: "#fff", borderRadius: 16,
            paddingHorizontal: 14, paddingVertical: 10,
            marginBottom: 16, elevation: 2,
          }}>
            <TextInput
              placeholder="Rechercher une dépense..."
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, fontSize: 15, color: "#333" }}
              placeholderTextColor="#bbb"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={{ color: "#bbb", fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* FILTRE PAR CATÉGORIE — seulement les catégories présentes dans la période */}
          {availableCategories.length > 0 && (
            <>
              <Text style={{ fontWeight: "700", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
                Catégorie
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginBottom: 20 }}>

                <TouchableOpacity
                  onPress={() => setActiveFilter("Tout")}
                  style={{
                    backgroundColor: activeFilter === "Tout" ? "#2ecc71" : "#fff",
                    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                    elevation: activeFilter === "Tout" ? 3 : 1,
                    borderWidth: activeFilter === "Tout" ? 0 : 1, borderColor: "#eee",
                  }}
                >
                  <Text style={{ color: activeFilter === "Tout" ? "#fff" : "#555", fontWeight: "600", fontSize: 13 }}>
                    Tout
                  </Text>
                </TouchableOpacity>

                {availableCategories.map((cat) => {
                  const isActive = activeFilter === cat.label;
                  return (
                    <TouchableOpacity
                      key={cat.label}
                      onPress={() => setActiveFilter(cat.label)}
                      style={{
                        backgroundColor: isActive ? cat.color : "#fff",
                        borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                        elevation: isActive ? 3 : 1,
                        borderWidth: isActive ? 0 : 1, borderColor: "#eee",
                      }}
                    >
                      <Text style={{ color: isActive ? "#fff" : "#555", fontWeight: "600", fontSize: 13 }}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {/* HEADER LISTE */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontWeight: "bold", fontSize: 17, color: "#1a1a1a" }}>
              {activeFilter === "Tout" ? "Toutes les dépenses" : activeFilter}
            </Text>
            <View style={{ backgroundColor: "#e8f8f0", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: "#2ecc71", fontWeight: "bold", fontSize: 13 }}>
                {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* LISTE DÉPENSES */}
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", padding: 50, backgroundColor: "#fff", borderRadius: 20 }}>
              <Text style={{ color: "#333", fontWeight: "bold", fontSize: 18 }}>
                Aucune dépense
              </Text>
              <Text style={{ color: "#999", fontSize: 14, marginTop: 6, textAlign: "center" }}>
                {search
                  ? "Aucun résultat pour cette recherche"
                  : activePeriod !== "Tout"
                  ? `Aucune dépense pour "${activePeriod}"`
                  : "Ajoutez votre première dépense !"}
              </Text>
            </View>
          ) : (
            filtered.map((item) => {
              const cat = CATEGORIES.find((c) => c.label === item.category);
              return (
                <View key={item.id} style={{
                  backgroundColor: "#fff", borderRadius: 20, padding: 16,
                  marginBottom: 12, elevation: 2,
                  borderLeftWidth: 4, borderLeftColor: cat?.color || "#2ecc71",
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 16, color: "#1a1a1a" }}>
                        {item.title}
                      </Text>
                      <Text style={{ color: "#bbb", fontSize: 12, marginTop: 2 }}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    <Text style={{ color: "#2ecc71", fontWeight: "bold", fontSize: 20 }}>
                      {formatAmount(item.amount)}
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: "row", justifyContent: "space-between",
                    alignItems: "center", marginTop: 12,
                    paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f5f5f5",
                  }}>
                    <CategoryBadge category={item.category} />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("ModifierDepense", { expense: item })}
                        style={{
                          backgroundColor: "#e8f8f0", borderRadius: 10,
                          paddingHorizontal: 12, paddingVertical: 6,
                        }}
                      >
                        <Text style={{ color: "#2ecc71", fontWeight: "600", fontSize: 13 }}>Modifier</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={{
                          backgroundColor: "#fff0f0", borderRadius: 10,
                          paddingHorizontal: 12, paddingVertical: 6,
                        }}
                      >
                        <Text style={{ color: "#e74c3c", fontWeight: "600", fontSize: 13 }}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* BOTTOM NAV — mobile uniquement */}
      {isMobile && (
        <View style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
          paddingBottom: 20,
          paddingTop: 10,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        }}>
          {[
            { label: "Accueil", icon: "🏠", onPress: null },
            { label: "Ajouter", icon: "➕", onPress: () => navigation.navigate("AjouterDepense") },
            { label: "Graphiques", icon: "📊", onPress: () => navigation.navigate("Graphiques") },
            { label: "Stats", icon: "📈", onPress: () => navigation.navigate("Statistiques") },
            { label: "Quitter", icon: "🚪", onPress: onLogout },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={{ flex: 1, alignItems: "center" }}
            >
              <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              <Text style={{ fontSize: 10, color: item.onPress === null ? "#2ecc71" : "#888", marginTop: 2, fontWeight: item.onPress === null ? "700" : "400" }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
