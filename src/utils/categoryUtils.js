import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCategories } from "../services/api";
import { CATEGORIES } from "./helpers";

const CACHE_KEY = "categories_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Charger les catégories (avec cache)
export const loadCategories = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    }
    const data = await getCategories(token);
    if (Array.isArray(data) && data.length > 0) {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
      return data;
    }
  } catch {}
  // Fallback sur les catégories hardcodées
  return CATEGORIES.map((c, i) => ({ id: i + 1, label: c.label, color: c.color, user_id: null, is_default: 1 }));
};

// Invalider le cache (appeler après ajout/suppression d'une catégorie)
export const invalidateCategoriesCache = async () => {
  try { await AsyncStorage.removeItem(CACHE_KEY); } catch {}
};

// Trouver la couleur d'une catégorie dans une liste
export const getCategoryColor = (categories, label) => {
  const cat = categories.find((c) => c.label === label);
  return cat ? cat.color : "#95a5a6";
};

// Palette de couleurs pour créer de nouvelles catégories
export const COLOR_PALETTE = [
  "#FF6B6B", "#FF8E53", "#FFA726", "#FFCC02",
  "#A8E063", "#4ECDC4", "#45B7D1", "#5C7AEA",
  "#DDA0DD", "#98D8C8", "#F06292", "#4DB6AC",
  "#95a5a6", "#e67e22", "#27ae60", "#8e44ad",
];
