import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllUsers, deleteUser, toggleBlockUser } from "../services/api";

const FILTERS = [
  { key: "tous", label: "Tous" },
  { key: "actif", label: "Actifs" },
  { key: "bloque", label: "Bloqués" },
];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("tous");

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const data = await getAllUsers(token);
        setUsers(Array.isArray(data) ? data : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleBlock = async (user) => {
    const msg = user.statut === "bloque"
      ? `Débloquer ${user.nom} ?`
      : `Bloquer ${user.nom} ?`;
    const ok = Platform.OS === "web" ? window.confirm(msg) : true;
    if (!ok) return;
    const token = await AsyncStorage.getItem("token");
    const result = await toggleBlockUser(token, user.id);
    setUsers((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, statut: result.statut } : u)
    );
  };

  const handleDeleteUser = async (user) => {
    const ok = Platform.OS === "web"
      ? window.confirm(`Supprimer ${user.nom} ? Cette action est irréversible.`)
      : true;
    if (!ok) return;
    const token = await AsyncStorage.getItem("token");
    await deleteUser(token, user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "tous" ||
      (activeFilter === "bloque" && u.statut === "bloque") ||
      (activeFilter === "actif" && u.statut !== "bloque");
    return matchSearch && matchFilter;
  });

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

        {/* Carte résumé */}
        <View style={{ backgroundColor: "#2ecc71", borderRadius: 14, padding: 16, marginBottom: 15 }}>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {users.length} utilisateurs inscrits
          </Text>
          <Text style={{ color: "#fff", opacity: 0.8, fontSize: 13 }}>
            {users.filter((u) => u.statut !== "bloque").length} actifs ·{" "}
            {users.filter((u) => u.statut === "bloque").length} bloqués
          </Text>
        </View>

        {/* Recherche */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "#fff", borderRadius: 12,
          paddingHorizontal: 14, paddingVertical: 14,
          marginBottom: 12, elevation: 1,
        }}>
          <TextInput
            placeholder="Rechercher par email..."
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

        {/* Filtres */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 15 }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={{
                backgroundColor: activeFilter === f.key ? "#1a1a2e" : "#fff",
                borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                elevation: 1, borderWidth: activeFilter === f.key ? 0 : 1, borderColor: "#eee",
              }}
            >
              <Text style={{
                color: activeFilter === f.key ? "#fff" : "#555",
                fontWeight: "600", fontSize: 13,
              }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Résultats */}
        <Text style={{ color: "#999", fontSize: 13, marginBottom: 10 }}>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </Text>

        {filtered.map((user) => (
          <View key={user.id} style={{
            backgroundColor: "#fff", borderRadius: 14,
            padding: 14, marginBottom: 10, elevation: 1,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontWeight: "bold", fontSize: 15 }}>{user.nom}</Text>
                  <View style={{
                    backgroundColor: user.role === "admin" ? "#e74c3c" : "#3498db",
                    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
                  }}>
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: "#999", fontSize: 13, marginTop: 2 }}>{user.email}</Text>
                <Text style={{ fontSize: 12, marginTop: 4 }}>
                  {user.statut === "bloque"
                    ? <Text style={{ color: "#e74c3c" }}>Bloqué</Text>
                    : <Text style={{ color: "#2ecc71" }}>Actif</Text>
                  }
                </Text>
              </View>

              {user.role !== "admin" && (
                <View style={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleToggleBlock(user)}
                    style={{
                      borderWidth: 1, borderColor: "#ccc",
                      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
                    }}
                  >
                    <Text style={{ color: "#333", fontWeight: "600", fontSize: 13 }}>
                      {user.statut === "bloque" ? "Débloquer" : "Bloquer"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteUser(user)}
                    style={{
                      borderWidth: 1, borderColor: "#ccc",
                      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
                    }}
                  >
                    <Text style={{ color: "#333", fontWeight: "600", fontSize: 13 }}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}
