import React from "react";
import { View, Text } from "react-native";
import { CATEGORIES } from "../utils/helpers";

export default function CategoryBadge({ category, categories = [] }) {
  // Cherche d'abord dans les catégories dynamiques, puis dans les défauts
  const cat = [...categories, ...CATEGORIES].find((c) => c.label === category);
  const color = cat ? cat.color : "#95a5a6";

  return (
    <View
      style={{
        backgroundColor: color,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "600" }}>{category}</Text>
    </View>
  );
}
