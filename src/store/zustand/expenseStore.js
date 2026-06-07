import { create } from "zustand";

const useExpenseStore = create((set) => ({
  expenses: [],
  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((item) => item.id !== id),
    })),
}));

export default useExpenseStore;
