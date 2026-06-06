import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Project, CreateProjectPayload, UpdateProjectPayload } from "@/types";

// Async thunks 

export const fetchProjects = createAsyncThunk<Project[], void, { rejectValue: string }>(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Project[]>("/projects");
      return res.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchProjectById = createAsyncThunk<Project, string, { rejectValue: string }>(
  "projects/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get<Project>(`/projects/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const createProject = createAsyncThunk<
  Project,
  CreateProjectPayload,
  { rejectValue: string }
>(
  "projects/create",
  async (payload, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const res = await api.post<Project>("/projects", {
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

export const updateProject = createAsyncThunk<
  Project,
  { id: string; data: UpdateProjectPayload },
  { rejectValue: string }
>(
  "projects/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch<Project>(`/projects/${id}`, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const deleteProject = createAsyncThunk<string, string, { rejectValue: string }>(
  "projects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// State─────

interface ProjectsState {
  items: Project[];
  selected: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

// Slice─────

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    selectProject(state, action: PayloadAction<Project | null>) {
      state.selected = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch projects";
      });

    // fetchProjectById
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch project";
      });

    // createProject
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create project";
      });

    // updateProject
    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update project";
      });

    // deleteProject
    builder
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete project";
      });
  },
});

export const { selectProject, clearError } = projectsSlice.actions;
export default projectsSlice.reducer;
