import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Platform, ScrollView,
} from "react-native";
import { forgotPassword, resetPassword } from "../services/api";

const showAlert = (msg) => {
  if (Platform.OS === "web") window.alert(msg);
};

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = code + nouveau mdp
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) { showAlert("Entrez votre email"); return; }
    setLoading(true);
    const data = await forgotPassword(email.trim());
    setLoading(false);
    if (data.message === "Code envoyé par email") {
      setStep(2);
    } else {
      showAlert(data.message || "Erreur");
    }
  };

  const handleReset = async () => {
    if (!code || !newPassword || !confirmPassword) {
      showAlert("Remplissez tous les champs"); return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("Les mots de passe ne correspondent pas"); return;
    }
    if (newPassword.length < 6) {
      showAlert("Mot de passe trop court (min 6 caractères)"); return;
    }
    setLoading(true);
    const data = await resetPassword(email.trim(), code.trim(), newPassword);
    setLoading(false);
    if (data.message === "Mot de passe réinitialisé avec succès !") {
      showAlert("Mot de passe réinitialisé ! Connectez-vous.");
      navigation.navigate("Login");
    } else {
      showAlert(data.message || "Erreur");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
      style={{ backgroundColor: "#f5f5f5" }}
    >
      {/* Titre */}
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: "#2ecc71" }}>
          Mot de passe oublié
        </Text>
        <Text style={{ color: "#999", marginTop: 8, textAlign: "center", lineHeight: 20 }}>
          {step === 1
            ? "Entrez votre email pour recevoir un code de vérification"
            : `Code envoyé à ${email}`}
        </Text>
      </View>

      {/* Indicateur d'étapes */}
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 28 }}>
        {[1, 2].map((s) => (
          <View
            key={s}
            style={{
              width: s === step ? 28 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: s <= step ? "#2ecc71" : "#ddd",
            }}
          />
        ))}
      </View>

      <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, elevation: 4 }}>

        {step === 1 ? (
          /* ÉTAPE 1 : email */
          <>
            <Text style={{ fontWeight: "600", marginBottom: 6, color: "#333" }}>Email</Text>
            <TextInput
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputStyle}
            />
            <TouchableOpacity
              onPress={handleSendCode}
              disabled={loading}
              style={{
                backgroundColor: "#2ecc71", padding: 16,
                borderRadius: 15, alignItems: "center", marginTop: 20,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Envoyer le code</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          /* ÉTAPE 2 : code + nouveau mot de passe */
          <>
            <Text style={{ fontWeight: "600", marginBottom: 6, color: "#333" }}>
              Code de vérification
            </Text>
            <TextInput
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              style={[inputStyle, { letterSpacing: 8, fontSize: 24, textAlign: "center" }]}
            />

            <Text style={{ fontWeight: "600", marginBottom: 6, marginTop: 16, color: "#333" }}>
              Nouveau mot de passe
            </Text>
            <TextInput
              placeholder="••••••••"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={inputStyle}
            />

            <Text style={{ fontWeight: "600", marginBottom: 6, marginTop: 14, color: "#333" }}>
              Confirmer le mot de passe
            </Text>
            <TextInput
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={inputStyle}
            />

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              style={{
                backgroundColor: "#2ecc71", padding: 16,
                borderRadius: 15, alignItems: "center", marginTop: 20,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Réinitialiser</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setStep(1); setCode(""); }}
              style={{ alignItems: "center", marginTop: 14 }}
            >
              <Text style={{ color: "#999", fontSize: 14 }}>Renvoyer le code</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{ alignItems: "center", marginTop: 18 }}
        >
          <Text style={{ color: "#2ecc71", fontWeight: "600" }}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: "#f5f5f5",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  color: "#333",
};
