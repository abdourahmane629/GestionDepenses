import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setPassword } from "../services/api";

export default function SetPasswordScreen({ onDone }) {
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 6) {
      Platform.OS === "web"
        ? window.alert("Minimum 6 caractères")
        : alert("Minimum 6 caractères");
      return;
    }
    if (password !== confirm) {
      Platform.OS === "web"
        ? window.alert("Les mots de passe ne correspondent pas")
        : alert("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const data = await setPassword(token, password);
      if (data.message === "Mot de passe défini avec succès !") {
        onDone();
      } else {
        const msg = data.message || "Erreur";
        Platform.OS === "web" ? window.alert(msg) : alert(msg);
      }
    } catch {
      Platform.OS === "web"
        ? window.alert("Erreur serveur")
        : alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    }}>
      <View style={{
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 28,
        width: "100%",
        maxWidth: 400,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}>
        <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 6 }}>🔑</Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", color: "#1a1a1a" }}>
          Créer un mot de passe
        </Text>
        <Text style={{ color: "#999", textAlign: "center", marginTop: 6, marginBottom: 24, fontSize: 14 }}>
          Pour vous connecter sur d'autres appareils sans Google
        </Text>

        <Text style={{ fontWeight: "600", marginBottom: 6, color: "#333" }}>Mot de passe</Text>
        <TextInput
          placeholder="Minimum 6 caractères"
          value={password}
          onChangeText={setPass}
          secureTextEntry
          style={inputStyle}
        />

        <Text style={{ fontWeight: "600", marginBottom: 6, marginTop: 14, color: "#333" }}>
          Confirmer
        </Text>
        <TextInput
          placeholder="Répétez le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          style={inputStyle}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: "#2ecc71",
            padding: 16,
            borderRadius: 15,
            alignItems: "center",
            marginTop: 22,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Enregistrer
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDone}
          style={{ alignItems: "center", marginTop: 14 }}
        >
          <Text style={{ color: "#aaa", fontSize: 14 }}>Ignorer pour l'instant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#f5f5f5",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
};
