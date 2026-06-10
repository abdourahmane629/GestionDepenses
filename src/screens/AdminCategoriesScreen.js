import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Platform, Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addCategoryAPI, deleteCategoryAPI } from "../services/api";
import { loadCategories, invalidateCategoriesCache, COLOR_PALETTE } from "../utils/categoryUtils";

const showAlert = (msg) => {
  if (Platform.OS === "web") window.alert(msg);
};

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddCat, setShowAddCat] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await invalidateCategoriesCache();
    const cats = await loadCategories();
    setCategories(cats);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newLabel.trim()) { showAlert("Entrez un nom"); return; }
    setAdding(true);
    const token = await AsyncStorage.getItem("token");
    const data = await addCategoryAPI(token, newLabel.trim(), newColor);
    setAdding(false);
    if (data.category) {
      await invalidateCategoriesCache();
      setCategories((prev) => [...prev, data.category]);
      setNewLabel("");
      setNewColor(COLOR_PALETTE[0]);
      setShowAddCat(false);
    } else {
      showAlert(data.message || "Erreur");
    }
  };

  const handleDelete = async (cat) => {
    const ok = Platform.OS === "web"
      ? window.confirm(`Supprimer la catégorie "${cat.label}" ?`)
      : true;
    if (!ok) return;
    const token = await AsyncStorage.getItem("token");
    const data = await deleteCategoryAPI(token, cat.id);
    if (data.message === "Catégorie supprimée") {
      await invalidateCategoriesCache();
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } else {
      showAlert(data.message || "Erreur");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  const globalCats = categories.filter((c) => c.user_id === null || c.user_id === undefined);
  const userCats = categories.filter((c) => c.user_id !== null && c.user_id !== undefined);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8faf8" }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16 }}>

        {/* Bouton ajouter */}
        <TouchableOpacity
          onPress={() => setShowAddCat(true)}
          style={{
            backgroundColor: "#2ecc71", borderRadius: 16,
            padding: 16, alignItems: "center", marginBottom: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
            + Nouvelle catégorie globale
          </Text>
        </TouchableOpacity>

        {/* Catégories globales */}
        <Text style={{ fontWeight: "bold", fontSize: 15, color: "#333", marginBottom: 10 }}>
          Catégories globales ({globalCats.length})
        </Text>
        {globalCats.map((cat) => (
          <View key={cat.id} style={{
            backgroundColor: "#fff", borderRadius: 14,
            padding: 14, marginBottom: 8, elevation: 1,
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: cat.color }} />
              <Text style={{ fontWeight: "600", fontSize: 15 }}>{cat.label}</Text>
              {cat.is_default === 1 && (
                <View style={{ backgroundColor: "#e8f8f0", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: "#2ecc71", fontSize: 11, fontWeight: "600" }}>Défaut</Text>
                </View>
              )}
            </View>
            {cat.is_default !== 1 && (
              <TouchableOpacity onPress={() => handleDelete(cat)}>
                <Text style={{ color: "#e74c3c", fontWeight: "600", fontSize: 13 }}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Catégories personnelles des utilisateurs */}
        {userCats.length > 0 && (
          <>
            <Text style={{ fontWeight: "bold", fontSize: 15, color: "#333", marginBottom: 10, marginTop: 20 }}>
              Catégories personnelles ({userCats.length})
            </Text>
            {userCats.map((cat) => (
              <View key={cat.id} style={{
                backgroundColor: "#fff", borderRadius: 14,
                padding: 14, marginBottom: 8, elevation: 1,
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: cat.color }} />
                  <View>
                    <Text style={{ fontWeight: "600", fontSize: 15 }}>{cat.label}</Text>
                    <Text style={{ color: "#999", fontSize: 11 }}>Utilisateur #{cat.user_id}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(cat)}>
                  <Text style={{ color: "#e74c3c", fontWeight: "600", fontSize: 13 }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 30 }} />
      </View>

      {/* MODAL — Nouvelle catégorie */}
      <Modal visible={showAddCat} transparent animationType="slide" onRequestClose={() => setShowAddCat(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20, color: "#1a1a1a" }}>
              Nouvelle catégorie globale
            </Text>

            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Nom</Text>
            <TextInput
              placeholder="Ex: Épargne"
              value={newLabel}
              onChangeText={setNewLabel}
              style={{
                backgroundColor: "#f5f5f5", borderRadius: 12,
                padding: 14, fontSize: 15, marginBottom: 16,
              }}
              autoFocus
            />

            <Text style={{ fontWeight: "600", marginBottom: 10 }}>Couleur</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {COLOR_PALETTE.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNewColor(color)}
                  style={{
                    width: 34, height: 34, borderRadius: 17,
                    backgroundColor: color,
                    borderWidth: newColor === color ? 3 : 0,
                    borderColor: "#1a1a2e",
                  }}
                />
              ))}
            </View>

            {newLabel.trim() ? (
              <View style={{
                backgroundColor: newColor, borderRadius: 20,
                paddingHorizontal: 16, paddingVertical: 8,
                alignSelf: "flex-start", marginBottom: 20,
              }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{newLabel}</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => { setShowAddCat(false); setNewLabel(""); }}
                style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: "#f0f0f0", alignItems: "center" }}
              >
                <Text style={{ color: "#666", fontWeight: "600" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                disabled={adding}
                style={{ flex: 2, padding: 14, borderRadius: 14, backgroundColor: "#2ecc71", alignItems: "center" }}
              >
                {adding
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "bold" }}>Ajouter</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
