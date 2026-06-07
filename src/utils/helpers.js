export const calculateTotal = (expenses) => {
  return expenses.reduce((sum, item) => sum + Number(item.amount), 0);
};

export const formatAmount = (amount) => {
  return Number(amount).toLocaleString("fr-GN") + " GNF";
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

export const CATEGORIES = [
  { label: "Alimentation", color: "#FF6B6B" },
  { label: "Transport", color: "#4ECDC4" },
  { label: "Logement", color: "#45B7D1" },
  { label: "Santé", color: "#96CEB4" },
  { label: "Loisirs", color: "#FFEAA7" },
  { label: "Éducation", color: "#DDA0DD" },
  { label: "Mobile Money", color: "#98D8C8" },
];