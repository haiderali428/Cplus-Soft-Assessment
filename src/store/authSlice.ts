import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api, { setAuthToken, storeUserId } from "@/lib/api";
import { User, LoginPayload, UserRole } from "@/types";

// Helpers

function stripPassword(user: User): User {
  const { password: _pw, ...safe } = user;
  return safe as User;
}

function mintToken(userId: string): string {
  return btoa(`${userId}:${Date.now()}`);
}

// Async thunks 

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  LoginPayload,
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.get<User[]>(`/users?email=${encodeURIComponent(email)}`);
    const user = res.data[0];

    if (!user || user.password !== password) {
      return rejectWithValue("Invalid email or password");
    }

    const token = mintToken(user.id);
    setAuthToken(token);
    storeUserId(user.id);
    return { user: stripPassword(user), token };
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const registerUser = createAsyncThunk<
  { user: User; token: string },
  { name: string; email: string; password: string; role: UserRole },
  { rejectValue: string }
>("auth/register", async ({ name, email, password, role }, { rejectWithValue }) => {
  try {
    const existing = await api.get<User[]>(`/users?email=${encodeURIComponent(email)}`);
    if (existing.data.length > 0) {
      return rejectWithValue("An account with this email already exists");
    }

    const now = new Date().toISOString();
    const res = await api.post<User>("/users", {
      name,
      email,
      password,
      role,
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      createdAt: now,
      updatedAt: now,
    });

    const user = res.data;
    const token = mintToken(user.id);
    setAuthToken(token);
    storeUserId(user.id);
    return { user: stripPassword(user), token };
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const fetchCurrentUser = createAsyncThunk<User, string, { rejectValue: string }>(
  "auth/fetchCurrentUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get<User>(`/users/${userId}`);
      return stripPassword(res.data);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// State

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

//  Slice 

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      setAuthToken(null);
    },
    clearError(state) {
      state.error = null;
    },
    restoreSession(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: AuthState) => {
      state.loading = true;
      state.error = null;
    };
    const onSuccess = (state: AuthState, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    };
    const onError = (state: AuthState, message: string) => {
      state.loading = false;
      state.error = message;
    };

    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, onSuccess)
      .addCase(loginUser.rejected, (state, a) => onError(state, a.payload ?? "Login failed"));

    builder
      .addCase(registerUser.pending, setLoading)
      .addCase(registerUser.fulfilled, onSuccess)
      .addCase(registerUser.rejected, (state, a) => onError(state, a.payload ?? "Registration failed"));

    builder
      .addCase(fetchCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, a) => {
        state.loading = false;
        state.user = a.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => { state.loading = false; });
  },
});

export const { logout, clearError, restoreSession } = authSlice.actions;
export default authSlice.reducer;
