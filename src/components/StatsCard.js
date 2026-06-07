import React from "react";
import { View, Text } from "react-native";
import { formatAmount } from "../utils/helpers";

export default function StatsCard({ total, count }) {
  return (
    <View
      style={{
        backgroundColor: "#2ecc71",
        margin: 10,
        padding: 20,
        borderRadius: 20,
        elevation: 4,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 14, opacity: 0.9 }}>
        Total des dépenses
      </Text>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
        {formatAmount(total)}
      </Text>
      <Text style={{ color: "#fff", opacity: 0.8, marginTop: 5 }}>
        {count} transaction{count > 1 ? "s" : ""}
      </Text>
    </View>
  );
}
