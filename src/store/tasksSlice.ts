import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types";

// Async thunks 

export const fetchTasks = createAsyncThunk<Task[], void, { rejectValue: string }>(
  "tasks/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Task[]>("/tasks");
      return res.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchTaskById = createAsyncThunk<Task, string, { rejectValue: string }>(
  "tasks/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get<Task>(`/tasks/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const createTask = createAsyncThunk<Task, CreateTaskPayload, { rejectValue: string }>(
  "tasks/create",
  async (payload, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const res = await api.post<Task>("/tasks", {
        ...payload,
        createdAt: now,
        updatedAt: now,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const updateTask = createAsyncThunk<
  Task,
  { id: string; data: UpdateTaskPayload },
  { rejectValue: string }
>(
  "tasks/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch<Task>(`/tasks/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const deleteTask = createAsyncThunk<string, string, { rejectValue: string }>(
  "tasks/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// State─────

interface TasksState {
  items: Task[];
  selected: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

// Slice─────

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    selectTask(state, action: PayloadAction<Task | null>) {
      state.selected = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    reorderTasksOptimistic(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchTasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch tasks";
      });

    // fetchTaskById
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch task";
      });

    // createTask
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create task";
      });

    // updateTask
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update task";
      });

    // deleteTask
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((t) => t.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete task";
      });
  },
});

export const { selectTask, clearError, reorderTasksOptimistic } = tasksSlice.actions;
export default tasksSlice.reducer;
