import React, { useEffect, useState, useCallback } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AdminScreen from "../screens/AdminScreen";
import EditExpenseScreen from "../screens/EditExpenseScreen";
import ChartsScreen from "../screens/ChartsScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";
import SetPasswordScreen from "../screens/SetPasswordScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
      setChecking(false);
    };
    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        {!user ? (
          /* ===== AUTH STACK ===== */
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={(loggedUser, needsPwd) => {
                    if (needsPwd) setNeedsPassword(true);
                    setUser(loggedUser);
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>

        ) : user.role === "admin" ? (
          /* ===== ADMIN STACK — uniquement le panel admin ===== */
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: "#2ecc71" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          >
            <Stack.Screen
              name="Admin"
              options={{ title: "Panel Admin", headerLeft: () => null }}
            >
              {(props) => <AdminScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen name="AdminGraphiques" component={ChartsScreen} options={{ title: "Graphiques" }} />
            <Stack.Screen name="AdminUtilisateurs" component={AdminUsersScreen} options={{ title: "Utilisateurs" }} />
          </Stack.Navigator>

        ) : (
          /* ===== USER STACK ===== */
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: "#2ecc71" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          >
            <Stack.Screen
              name="Accueil"
              options={{ title: "Mes Dépenses", headerLeft: () => null }}
            >
              {(props) => <HomeScreen {...props} onLogout={logout} />}
            </Stack.Screen>
            <Stack.Screen name="AjouterDepense" component={AddExpenseScreen} options={{ title: "Nouvelle Dépense" }} />
            <Stack.Screen name="Statistiques" component={StatisticsScreen} options={{ title: "Statistiques" }} />
            <Stack.Screen name="Graphiques" component={ChartsScreen} options={{ title: "Graphiques" }} />
            <Stack.Screen name="ModifierDepense" component={EditExpenseScreen} options={{ title: "Modifier la dépense" }} />
          </Stack.Navigator>
        )}
      </NavigationContainer>

      {needsPassword && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <SetPasswordScreen onDone={() => setNeedsPassword(false)} />
        </View>
      )}
    </>
  );
}
