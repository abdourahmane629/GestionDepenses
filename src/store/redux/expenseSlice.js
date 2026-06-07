import { createSlice } from "@reduxjs/toolkit";

const expenseSlice = createSlice({
  name: "expenses",
  initialState: { expenses: [] },
  reducers: {
    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
    },
    removeExpense: (state, action) => {
      state.expenses = state.expenses.filter(
        (item) => item.id !== action.payload
      );
    },
    updateExpense: (state, action) => {
      const index = state.expenses.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) state.expenses[index] = action.payload;
    },
  },
});

export const { addExpense, removeExpense, updateExpense } =
  expenseSlice.actions;
export default expenseSlice.reducer;
