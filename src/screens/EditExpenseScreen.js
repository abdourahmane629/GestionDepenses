import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Platform, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CATEGORIES } from "../utils/helpers";

export default function EditExpenseScreen({ route, navigation }) {
  const { expense } = route.params;
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim() || !amount.trim()) {
      Platform.OS === "web" && window.alert("Veuillez remplir tous les champs.");
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      Platform.OS === "web" && window.alert("Montant invalide.");
      return;
    }
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/expenses/${expense.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        amount: Number(amount),
        category,
        date: expense.date,
      }),
    });
    const result = await response.json();
    setLoading(false);
    if (result.message === "Dépense modifiée !") {
      navigation.goBack();
    } else {
      Platform.OS === "web" && window.alert(result.message || "Erreur");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5", padding: 15 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6 }}>Titre</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={inputStyle}
      />

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6, marginTop: 15 }}>
        Montant (GNF)
      </Text>
      <TextInput
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
            <Text style={{ fontWeight: "600" }}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleUpdate}
        disabled={loading}
        style={{
          backgroundColor: "#2ecc71", padding: 16, borderRadius: 15,
          alignItems: "center", marginTop: 30,
        }}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Modifier</Text>
        }
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