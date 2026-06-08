import React, { useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  useWindowDimensions, Image, Animated,
} from "react-native";

const features = [
  {
    icon: "📊",
    color: "#e8f8f0",
    accent: "#2ecc71",
    title: "Suivi en temps réel",
    desc: "Enregistrez chaque dépense instantanément et gardez le contrôle.",
  },
  {
    icon: "📈",
    color: "#e8f0ff",
    accent: "#5b8dee",
    title: "Statistiques claires",
    desc: "Visualisez vos habitudes par période et par catégorie.",
  },
  {
    icon: "🗂️",
    color: "#fff4e6",
    accent: "#f39c12",
    title: "Catégories organisées",
    desc: "Alimentation, Transport, Santé… tout est classé automatiquement.",
  },
  {
    icon: "🔒",
    color: "#fdecea",
    accent: "#e74c3c",
    title: "Sécurisé & privé",
    desc: "Vos données sont protégées. Connexion Google ou email.",
  },
];

function FeatureCard({ feature, delay }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
    }}>
      <View style={{
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
      }}>
        <View style={{
          width: 56, height: 56,
          borderRadius: 16,
          backgroundColor: feature.color,
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Text style={{ fontSize: 26 }}>{feature.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>
            {feature.title}
          </Text>
          <Text style={{ fontSize: 13, color: "#888", lineHeight: 19 }}>
            {feature.desc}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function WelcomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8faf8" }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={{
        backgroundColor: "#2ecc71",
        paddingTop: isWide ? 80 : 60,
        paddingBottom: 70,
        paddingHorizontal: 28,
        alignItems: "center",
        borderBottomLeftRadius: 48,
        borderBottomRightRadius: 48,
        overflow: "hidden",
      }}>
        {/* Cercles décoratifs en arrière-plan */}
        <View style={{
          position: "absolute", width: 300, height: 300,
          borderRadius: 150, backgroundColor: "rgba(255,255,255,0.07)",
          top: -80, right: -80,
        }} />
        <View style={{
          position: "absolute", width: 200, height: 200,
          borderRadius: 100, backgroundColor: "rgba(255,255,255,0.07)",
          bottom: -60, left: -60,
        }} />

        <Animated.View style={{
          opacity: heroAnim,
          transform: [{ scale: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          alignItems: "center",
        }}>
          {/* Logo */}
          <View style={{
            width: 90, height: 90, borderRadius: 26,
            backgroundColor: "#fff",
            justifyContent: "center", alignItems: "center",
            marginBottom: 24,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          }}>
            <Image
              source={require("../../assets/icon.png")}
              style={{ width: 64, height: 64, borderRadius: 16 }}
              resizeMode="contain"
            />
          </View>

          <Text style={{
            fontSize: isWide ? 38 : 30,
            fontWeight: "bold",
            color: "#fff",
            textAlign: "center",
            marginBottom: 12,
          }}>
            Gestion Dépenses
          </Text>
          <Text style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.88)",
            textAlign: "center",
            maxWidth: 340,
            lineHeight: 23,
            marginBottom: 36,
          }}>
            Prenez le contrôle de vos finances. Simple, rapide et sécurisé.
          </Text>

          {/* Boutons */}
          <View style={{ gap: 12, width: "100%", maxWidth: 340 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={{
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 17,
                alignItems: "center",
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
              }}
            >
              <Text style={{ color: "#2ecc71", fontSize: 16, fontWeight: "bold" }}>
                Créer un compte gratuit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                borderRadius: 18,
                padding: 17,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.6)",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* STATS VISUELLES */}
      <View style={{
        flexDirection: "row",
        marginHorizontal: 20,
        marginTop: -24,
        gap: 10,
        marginBottom: 28,
      }}>
        {[
          { value: "100%", label: "Gratuit" },
          { value: "∞", label: "Dépenses" },
          { value: "🔒", label: "Sécurisé" },
        ].map((s) => (
          <View key={s.label} style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 16,
            alignItems: "center",
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#2ecc71" }}>{s.value}</Text>
            <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* FEATURES */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <Text style={{
          fontSize: 20, fontWeight: "bold", color: "#1a1a1a",
          marginBottom: 20,
        }}>
          Pourquoi choisir cette app ?
        </Text>

        {features.map((f, i) => (
          <FeatureCard key={f.title} feature={f} delay={i * 100} />
        ))}
      </View>

      {/* CTA final */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 50, alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{
            backgroundColor: "#2ecc71",
            borderRadius: 18,
            padding: 18,
            width: "100%",
            maxWidth: 380,
            alignItems: "center",
            elevation: 4,
            shadowColor: "#2ecc71",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold" }}>
            Commencer maintenant
          </Text>
        </TouchableOpacity>
        <Text style={{ color: "#bbb", fontSize: 12, marginTop: 12 }}>
          Gratuit · Sans carte bancaire
        </Text>
      </View>
    </ScrollView>
  );
}
