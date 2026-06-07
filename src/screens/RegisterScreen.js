import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { register, loginWithGoogle } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID     = "REMPLACE_PAR_TON_WEB_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = "REMPLACE_PAR_TON_ANDROID_CLIENT_ID.apps.googleusercontent.com";
const GOOGLE_IOS_CLIENT_ID     = "REMPLACE_PAR_TON_IOS_CLIENT_ID.apps.googleusercontent.com";

export default function RegisterScreen({ navigation }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId:     GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) handleGoogleRegister(idToken);
    }
  }, [response]);

  const handleGoogleRegister = async (idToken) => {
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(idToken);
      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        // Rediriger vers Login qui va déclencher onLogin via AppNavigator
        navigation.navigate("Login");
      } else {
        const msg = data.message || "Erreur Google";
        Platform.OS === "web" ? window.alert(msg) : Alert.alert("Erreur", msg);
      }
    } catch {
      const msg = "Erreur serveur Google";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Erreur", msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!nom || !email || !password) {
      Platform.OS === "web"
        ? window.alert("Veuillez remplir tous les champs")
        : Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      const data = await register(nom, email, password, "user");
      if (data.message === "Compte créé avec succès !") {
        Platform.OS === "web"
          ? window.alert("Compte créé ! Connectez-vous.")
          : Alert.alert("Succès", "Compte créé ! Connectez-vous.");
        navigation.navigate("Login");
      } else {
        Platform.OS === "web"
          ? window.alert(data.message)
          : Alert.alert("Erreur", data.message);
      }
    } catch {
      Platform.OS === "web"
        ? window.alert("Erreur serveur")
        : Alert.alert("Erreur", "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", justifyContent: "center", padding: 20 }}>
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#2ecc71" }}>
          Créer un compte
        </Text>
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 25, elevation: 4 }}>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Nom complet</Text>
        <TextInput
          placeholder="Votre nom"
          value={nom}
          onChangeText={setNom}
          style={inputStyle}
        />

        <Text style={{ fontWeight: "600", marginBottom: 6, marginTop: 15 }}>Email</Text>
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
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: "#2ecc71", padding: 16, borderRadius: 15,
            alignItems: "center", marginTop: 25,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>S'inscrire</Text>
          }
        </TouchableOpacity>

        {/* Séparateur */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#eee" }} />
          <Text style={{ color: "#bbb", marginHorizontal: 10, fontSize: 13 }}>ou</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#eee" }} />
        </View>

        {/* Bouton Google */}
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
              <Text style={{ fontSize: 17, fontWeight: "bold", color: "#4285F4" }}>G</Text>
              <Text style={{ color: "#444", fontSize: 15, fontWeight: "600" }}>
                Continuer avec Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{ alignItems: "center", marginTop: 16 }}
        >
          <Text style={{ color: "#2ecc71" }}>Déjà un compte ? Se connecter</Text>
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
