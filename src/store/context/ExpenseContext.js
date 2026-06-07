import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ExpenseContext = createContext();

const STORAGE_KEY = "expenses_data";

const initialExpenses = [
  {
    id: "1",
    title: "Achat riz",
    amount: 250000,
    category: "Alimentation",
    date: "2026-05-20",
  },
  {
    id: "2",
    title: "Taxi",
    amount: 50000,
    category: "Transport",
    date: "2026-05-21",
  },
  {
    id: "3",
    title: "Forfait Orange",
    amount: 100000,
    category: "Mobile Money",
    date: "2026-05-22",
  },
];

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setExpenses(JSON.parse(stored));
        } else {
          // Première fois : charger les données initiales
          setExpenses(initialExpenses);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialExpenses));
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
        setExpenses(initialExpenses);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  // Sauvegarder automatiquement à chaque changement
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)).catch(
        (error) => console.error("Erreur sauvegarde:", error)
      );
    }
  }, [expenses, loading]);

  const addExpense = (expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const removeExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const updateExpense = (updatedExpense) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === updatedExpense.id ? updatedExpense : item
      )
    );
  };

  return (
    <ExpenseContext.Provider
      value={{ expenses, addExpense, removeExpense, updateExpense, loading }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);