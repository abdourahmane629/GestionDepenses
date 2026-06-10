import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Platform, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile, updateProfile, changePassword } from "../services/api";

const showAlert = (msg) => {
  if (Platform.OS === "web") window.alert(msg);
  else Alert.alert("", msg);
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modification profil
  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Modification mot de passe
  const [changingPwd, setChangingPwd] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    const data = await getProfile(token);
    if (data.id) {
      setProfile(data);
      setNom(data.nom);
      setEmail(data.email);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!nom.trim() || !email.trim()) { showAlert("Nom et email requis"); return; }
    setSaving(true);
    const token = await AsyncStorage.getItem("token");
    const data = await updateProfile(token, { nom: nom.trim(), email: email.trim() });
    setSaving(false);
    if (data.message === "Profil mis à jour !") {
      // Mettre à jour le user stocké localement
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        await AsyncStorage.setItem("user", JSON.stringify({ ...u, nom: nom.trim(), email: email.trim() }));
      }
      setProfile((p) => ({ ...p, nom: nom.trim(), email: email.trim() }));
      setEditing(false);
      showAlert("Profil mis à jour !");
    } else {
      showAlert(data.message || "Erreur");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) { showAlert("Remplissez tous les champs"); return; }
    if (newPwd !== confirmPwd) { showAlert("Les mots de passe ne correspondent pas"); return; }
    if (newPwd.length < 6) { showAlert("Mot de passe trop court (min 6 caractères)"); return; }
    setSavingPwd(true);
    const token = await AsyncStorage.getItem("token");
    const data = await changePassword(token, oldPwd, newPwd);
    setSavingPwd(false);
    if (data.message === "Mot de passe modifié avec succès !") {
      setChangingPwd(false);
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      showAlert("Mot de passe modifié !");
    } else {
      showAlert(data.message || "Erreur");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8faf8" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  const initials = (profile?.nom || "?")
    .split(" ")
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8faf8" }} showsVerticalScrollIndicator={false}>

      {/* Header vert avec avatar */}
      <View style={{
        backgroundColor: "#2ecc71",
        paddingTop: 30, paddingBottom: 50,
        alignItems: "center",
      }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.25)",
          justifyContent: "center", alignItems: "center", marginBottom: 12,
        }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>{initials}</Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>
          {profile?.nom}
        </Text>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, marginTop: 8,
        }}>
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
            {profile?.role === "admin" ? "Administrateur" : "Utilisateur"}
          </Text>
        </View>
        {joined ? (
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 6 }}>
            Membre depuis {joined}
          </Text>
        ) : null}
      </View>

      <View style={{ padding: 20, marginTop: -24 }}>

        {/* Carte Informations */}
        <View style={{
          backgroundColor: "#fff", borderRadius: 20,
          padding: 20, elevation: 3, marginBottom: 16,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, color: "#1a1a1a" }}>Informations</Text>
            <TouchableOpacity onPress={() => { setEditing(!editing); setNom(profile?.nom); setEmail(profile?.email); }}>
              <Text style={{ color: "#2ecc71", fontWeight: "600" }}>
                {editing ? "Annuler" : "Modifier"}
              </Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              <Text style={labelStyle}>Nom complet</Text>
              <TextInput value={nom} onChangeText={setNom} style={inputStyle} />
              <Text style={[labelStyle, { marginTop: 14 }]}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={inputStyle}
              />
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: "#2ecc71", borderRadius: 14,
                  padding: 14, alignItems: "center", marginTop: 18,
                }}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Enregistrer</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <InfoRow label="Nom" value={profile?.nom} />
              <InfoRow label="Email" value={profile?.email} />
              <InfoRow
                label="Statut"
                value={profile?.statut === "bloque" ? "Bloqué" : "Actif"}
                valueColor={profile?.statut === "bloque" ? "#e74c3c" : "#2ecc71"}
              />
            </>
          )}
        </View>

        {/* Carte Mot de passe */}
        <View style={{
          backgroundColor: "#fff", borderRadius: 20,
          padding: 20, elevation: 3, marginBottom: 30,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, color: "#1a1a1a" }}>Mot de passe</Text>
            <TouchableOpacity onPress={() => { setChangingPwd(!changingPwd); setOldPwd(""); setNewPwd(""); setConfirmPwd(""); }}>
              <Text style={{ color: "#2ecc71", fontWeight: "600" }}>
                {changingPwd ? "Annuler" : "Changer"}
              </Text>
            </TouchableOpacity>
          </View>

          {changingPwd ? (
            <>
              <Text style={labelStyle}>Ancien mot de passe</Text>
              <TextInput
                value={oldPwd}
                onChangeText={setOldPwd}
                secureTextEntry
                placeholder="••••••••"
                style={inputStyle}
              />
              <Text style={[labelStyle, { marginTop: 14 }]}>Nouveau mot de passe</Text>
              <TextInput
                value={newPwd}
                onChangeText={setNewPwd}
                secureTextEntry
                placeholder="••••••••"
                style={inputStyle}
              />
              <Text style={[labelStyle, { marginTop: 14 }]}>Confirmer</Text>
              <TextInput
                value={confirmPwd}
                onChangeText={setConfirmPwd}
                secureTextEntry
                placeholder="••••••••"
                style={inputStyle}
              />
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={savingPwd}
                style={{
                  backgroundColor: "#1a1a2e", borderRadius: 14,
                  padding: 14, alignItems: "center", marginTop: 18,
                }}
              >
                {savingPwd
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Modifier le mot de passe</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: "#bbb", fontSize: 22, letterSpacing: 4 }}>••••••••</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, valueColor = "#333" }) {
  return (
    <View style={{
      flexDirection: "row", justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
    }}>
      <Text style={{ color: "#888", fontSize: 14 }}>{label}</Text>
      <Text style={{ color: valueColor, fontSize: 14, fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

const labelStyle = {
  fontWeight: "600",
  marginBottom: 6,
  color: "#333",
  fontSize: 14,
};

const inputStyle = {
  backgroundColor: "#f5f5f5",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  color: "#333",
};
