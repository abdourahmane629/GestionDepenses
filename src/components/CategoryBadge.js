import React from "react";
import { View, Text } from "react-native";
import { CATEGORIES } from "../utils/helpers";

export default function CategoryBadge({ category }) {
  const cat = CATEGORIES.find((c) => c.label === category);
  const color = cat ? cat.color : "#ccc";

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
