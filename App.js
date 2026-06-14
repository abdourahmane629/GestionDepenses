import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

class ErrorBoundary extends React.Component {
  state = { error: null };

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 24, paddingTop: 60 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#e74c3c", marginBottom: 12 }}>
            Erreur détectée
          </Text>
          <ScrollView style={{ backgroundColor: "#f5f5f5", borderRadius: 8, padding: 12 }}>
            <Text style={{ fontFamily: "monospace", fontSize: 12, color: "#333" }}>
              {this.state.error?.message}
              {"\n\n"}
              {this.state.error?.stack}
            </Text>
          </ScrollView>
          <TouchableOpacity
            onPress={() => this.setState({ error: null })}
            style={{ marginTop: 16, backgroundColor: "#2ecc71", padding: 14, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}
