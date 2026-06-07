import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { login, loginWithGoogle } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = "952722038853-9hlvu7vsjcqbmva3qi098g4di8885at3.apps.googleusercontent.com";

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    responseType: "id_token",
    usePKCE: false,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken =
        response.params?.id_token ||
        response.authentication?.idToken;
      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        Platform.OS === "web" && window.alert("Token non trouvé");
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(idToken);
      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user, data.needsPassword);
      } else {
        Platform.OS === "web" && window.alert(data.message || "Erreur Google");
      }
    } catch {
      Platform.OS === "web" && window.alert("Erreur serveur Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Platform.OS === "web" && window.alert("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        Platform.OS === "web" && window.alert(data.message);
      }
    } catch {
      Platform.OS === "web" && window.alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", justifyContent: "center", padding: 20 }}>
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Text style={{ fontSize: 50 }}>💰</Text>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#2ecc71" }}>
          Gestion Dépenses
        </Text>
        <Text style={{ color: "#999", marginTop: 5 }}>Connectez-vous pour continuer</Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 25, elevation: 4 }}>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Email</Text>
        <TextInput
          placeholder="votre@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={inputStyle}
        />

        <Text style={{ fontWeight: "600", marginBottom: 6, marginTop: 15 }}>Mot de passe</Text>
        <TextInput
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={inputStyle}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: "#2ecc71", padding: 16, borderRadius: 15,
            alignItems: "center", marginTop: 25,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Se connecter</Text>
          }
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#eee" }} />
          <Text style={{ color: "#bbb", marginHorizontal: 10 }}>ou</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#eee" }} />
        </View>

        <TouchableOpacity
          onPress={() => promptAsync()}
          disabled={!request || googleLoading}
          style={{
            backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd",
            padding: 14, borderRadius: 15, alignItems: "center",
            flexDirection: "row", justifyContent: "center", gap: 10,
          }}
        >
          {googleLoading ? (
            <ActivityIndicator color="#444" />
          ) : (
            <>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#4285F4" }}>G</Text>
              <Text style={{ color: "#444", fontSize: 15, fontWeight: "600" }}>
                Continuer avec Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ alignItems: "center", marginTop: 16 }}
        >
          <Text style={{ color: "#2ecc71" }}>Pas de compte ? S'inscrire</Text>
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