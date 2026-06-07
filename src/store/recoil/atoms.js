import { atom, selector } from "recoil";

export const expensesState = atom({
  key: "expensesState",
  default: [],
});

export const totalExpensesSelector = selector({
  key: "totalExpensesSelector",
  get: ({ get }) => {
    const expenses = get(expensesState);
    return expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  },
});