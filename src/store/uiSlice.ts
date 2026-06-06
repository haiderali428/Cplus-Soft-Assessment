import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "@/types";

export type TaskFilterValue = "all" | "mine";

interface UIState {
  sidebarOpen:  boolean;
  activeModal:  string | null;
  searchQuery:  string;
  taskFilter:   TaskFilterValue;
  editingTask:  Task | null;
}

const initialState: UIState = {
  sidebarOpen: false,
  activeModal: null,
  searchQuery: "",
  taskFilter:  "all",
  editingTask: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setTaskFilter(state, action: PayloadAction<TaskFilterValue>) {
      state.taskFilter = action.payload;
    },
    setEditingTask(state, action: PayloadAction<Task>) {
      state.editingTask = action.payload;
    },
    clearEditingTask(state) {
      state.editingTask = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  setSearchQuery,
  setTaskFilter,
  setEditingTask,
  clearEditingTask,
} = uiSlice.actions;

export default uiSlice.reducer;
