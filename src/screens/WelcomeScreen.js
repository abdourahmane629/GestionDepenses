import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView, useWindowDimensions,
} from "react-native";

const features = [
  { title: "Suivi des dépenses", desc: "Enregistrez et catégorisez toutes vos dépenses facilement." },
  { title: "Statistiques détaillées", desc: "Visualisez vos habitudes de dépenses par période et catégorie." },
  { title: "Graphiques interactifs", desc: "Analysez votre budget avec des graphiques clairs et lisibles." },
  { title: "Connexion Google", desc: "Connectez-vous en un clic avec votre compte Google." },
];

export default function WelcomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8faf8" }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={{
        backgroundColor: "#2ecc71",
        paddingTop: isWide ? 80 : 60,
        paddingBottom: 60,
        paddingHorizontal: 24,
        alignItems: "center",
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
      }}>
        <Text style={{
          fontSize: isWide ? 42 : 32,
          fontWeight: "bold",
          color: "#fff",
          textAlign: "center",
          marginBottom: 12,
        }}>
          Gestion Dépenses
        </Text>
        <Text style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          maxWidth: 400,
          lineHeight: 24,
          marginBottom: 36,
        }}>
          Prenez le contrôle de vos finances. Suivez, analysez et optimisez vos dépenses au quotidien.
        </Text>

        <View style={{ gap: 12, width: "100%", maxWidth: 360 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#2ecc71", fontSize: 16, fontWeight: "bold" }}>
              Créer un compte
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.5)",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FEATURES */}
      <View style={{ padding: 24 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#1a1a1a",
          textAlign: "center",
          marginBottom: 24,
        }}>
          Tout ce dont vous avez besoin
        </Text>

        <View style={{
          flexDirection: isWide ? "row" : "column",
          flexWrap: "wrap",
          gap: 12,
        }}>
          {features.map((f) => (
            <View
              key={f.title}
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 20,
                flex: isWide ? 1 : undefined,
                minWidth: isWide ? 200 : undefined,
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 15, color: "#1a1a1a", marginBottom: 6 }}>
                {f.title}
              </Text>
              <Text style={{ fontSize: 13, color: "#888", lineHeight: 20 }}>
                {f.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA bas */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 48, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{
            backgroundColor: "#2ecc71",
            borderRadius: 16,
            padding: 18,
            width: "100%",
            maxWidth: 360,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            Commencer gratuitement
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
