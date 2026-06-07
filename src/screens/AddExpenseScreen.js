import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addExpenseAPI } from "../services/api";
import { CATEGORIES } from "../utils/helpers";

export default function AddExpenseScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentation");

  const handleSubmit = async () => {
    if (!title.trim() || !amount.trim()) {
      Platform.OS === "web"
        ? window.alert("Veuillez remplir tous les champs.")
        : null;
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Platform.OS === "web"
        ? window.alert("Le montant doit être un nombre positif.")
        : null;
      return;
    }

    const token = await AsyncStorage.getItem("token");
    const result = await addExpenseAPI(token, {
      title: title.trim(),
      amount: Number(amount),
      category,
      date: new Date().toISOString().split("T")[0],
    });

    if (result.id) {
      navigation.goBack();
    } else {
      Platform.OS === "web"
        ? window.alert(result.message || "Erreur lors de l'ajout")
        : null;
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
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            onPress={() => setCategory(cat.label)}
            style={{
              backgroundColor: category === cat.label ? cat.color : "#e0e0e0",
              borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: "#2ecc71", padding: 16, borderRadius: 15,
          alignItems: "center", marginTop: 30,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          Ajouter la dépense
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  elevation: 2,
};