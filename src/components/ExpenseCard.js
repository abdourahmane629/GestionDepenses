import React from "react";
import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import CategoryBadge from "./CategoryBadge";
import { formatAmount, formatDate } from "../utils/helpers";
import { useExpenses } from "../store/context/ExpenseContext";

export default function ExpenseCard({ expense }) {
  const { removeExpense } = useExpenses();

  const handleDelete = () => {
    if (Platform.OS === "web") {
      // Sur le web, utiliser confirm() du navigateur
      const confirmed = window.confirm(
        `Supprimer "${expense.title}" ?`
      );
      if (confirmed) removeExpense(expense.id);
    } else {
      // Sur mobile, utiliser Alert de React Native
      Alert.alert("Supprimer", "Voulez-vous supprimer cette dépense ?", [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => removeExpense(expense.id),
        },
      ]);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        marginHorizontal: 10,
        marginVertical: 6,
        padding: 15,
        borderRadius: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", fontSize: 16, flex: 1 }}>
          {expense.title}
        </Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={{ fontSize: 13, color: "#e74c3c", fontWeight: "600" }}>Supprimer</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: "#2ecc71", fontWeight: "bold", fontSize: 20, marginTop: 4 }}>
        {formatAmount(expense.amount)}
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <CategoryBadge category={expense.category} />
        <Text style={{ color: "#999", fontSize: 12 }}>
          {formatDate(expense.date)}
        </Text>
      </View>
    </View>
  );
}