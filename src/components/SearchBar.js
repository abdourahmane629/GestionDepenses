import React from "react";
import { TextInput, View } from "react-native";

export default function SearchBar({ value, onChangeText }) {
  return (
    <View style={{ margin: 10 }}>
      <TextInput
        placeholder="Rechercher une dépense..."
        value={value}
        onChangeText={onChangeText}
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 12,
          fontSize: 15,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
        }}
      />
    </View>
  );
}
