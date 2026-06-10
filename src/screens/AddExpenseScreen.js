import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator, Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addExpenseAPI, addCategoryAPI } from "../services/api";
import { loadCategories, invalidateCategoriesCache, COLOR_PALETTE } from "../utils/categoryUtils";

export default function AddExpenseScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ajout nouvelle catégorie
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);
  const [addingCat, setAddingCat] = useState(false);

  useEffect(() => {
    loadCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !category) setCategory(cats[0].label);
    });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !amount.trim()) {
      Platform.OS === "web" && window.alert("Veuillez remplir tous les champs.");
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Platform.OS === "web" && window.alert("Le montant doit être un nombre positif.");
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const result = await addExpenseAPI(token, {
      title: title.trim(),
      amount: Number(amount),
      category,
      date: new Date().toISOString().split("T")[0],
    });
    setLoading(false);
    if (result.id) {
      navigation.goBack();
    } else {
      Platform.OS === "web" && window.alert(result.message || "Erreur lors de l'ajout");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatLabel.trim()) {
      Platform.OS === "web" && window.alert("Entrez un nom de catégorie");
      return;
    }
    setAddingCat(true);
    const token = await AsyncStorage.getItem("token");
    const data = await addCategoryAPI(token, newCatLabel.trim(), newCatColor);
    setAddingCat(false);
    if (data.category) {
      await invalidateCategoriesCache();
      const newCats = [...categories, data.category];
      setCategories(newCats);
      setCategory(data.category.label);
      setNewCatLabel("");
      setNewCatColor(COLOR_PALETTE[0]);
      setShowAddCat(false);
    } else {
      Platform.OS === "web" && window.alert(data.message || "Erreur");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5", padding: 15 }}>

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6 }}>
        Titre de la dépense
      </Text>
      <TextInput
        placeholder="Ex: Achat riz"
        value={title}
        onChangeText={setTitle}
        style={inputStyle}
      />

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6, marginTop: 15 }}>
        Montant (GNF)
      </Text>
      <TextInput
        placeholder="Ex: 250000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={inputStyle}
      />

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 10, marginTop: 15 }}>
        Catégorie
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setCategory(cat.label)}
            style={{
              backgroundColor: category === cat.label ? cat.color : "#fff",
              borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
              borderWidth: 1,
              borderColor: category === cat.label ? cat.color : "#ddd",
            }}
          >
            <Text style={{ fontWeight: "600", color: category === cat.label ? "#fff" : "#333", fontSize: 13 }}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Bouton ajouter catégorie */}
        <TouchableOpacity
          onPress={() => setShowAddCat(true)}
          style={{
            borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
            borderWidth: 1.5, borderColor: "#2ecc71", borderStyle: "dashed",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: "#2ecc71", fontWeight: "600", fontSize: 13 }}>+ Nouvelle</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: "#2ecc71", padding: 16, borderRadius: 15,
          alignItems: "center", marginTop: 20,
        }}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Ajouter la dépense</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* MODAL — Nouvelle catégorie */}
      <Modal visible={showAddCat} transparent animationType="slide" onRequestClose={() => setShowAddCat(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20, color: "#1a1a1a" }}>
              Nouvelle catégorie
            </Text>

            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Nom</Text>
            <TextInput
              placeholder="Ex: Épargne"
              value={newCatLabel}
              onChangeText={setNewCatLabel}
              style={inputStyle}
              autoFocus
            />

            <Text style={{ fontWeight: "600", marginBottom: 10, marginTop: 16 }}>Couleur</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {COLOR_PALETTE.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setNewCatColor(color)}
                  style={{
                    width: 34, height: 34, borderRadius: 17,
                    backgroundColor: color,
                    borderWidth: newCatColor === color ? 3 : 0,
                    borderColor: "#1a1a2e",
                  }}
                />
              ))}
            </View>

            {/* Aperçu */}
            {newCatLabel.trim() ? (
              <View style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: newCatColor, borderRadius: 20,
                paddingHorizontal: 16, paddingVertical: 8,
                alignSelf: "flex-start", marginBottom: 20,
              }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{newCatLabel}</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => { setShowAddCat(false); setNewCatLabel(""); }}
                style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: "#f0f0f0", alignItems: "center" }}
              >
                <Text style={{ color: "#666", fontWeight: "600" }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCategory}
                disabled={addingCat}
                style={{ flex: 2, padding: 14, borderRadius: 14, backgroundColor: "#2ecc71", alignItems: "center" }}
              >
                {addingCat
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

const inputStyle = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  elevation: 2,
  marginBottom: 2,
};
