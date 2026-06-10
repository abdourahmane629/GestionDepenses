import React, { useEffect, useState, useCallback } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AdminScreen from "../screens/AdminScreen";
import EditExpenseScreen from "../screens/EditExpenseScreen";
import ChartsScreen from "../screens/ChartsScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";
import SetPasswordScreen from "../screens/SetPasswordScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AdminCategoriesScreen from "../screens/AdminCategoriesScreen";

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
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
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
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>

        ) : user.role === "admin" ? (
          /* ===== ADMIN STACK ===== */
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
            <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ title: "Catégories" }} />
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
            <Stack.Screen name="Profil" component={ProfileScreen} options={{ title: "Mon Profil" }} />
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
