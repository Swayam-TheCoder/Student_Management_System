import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { authApi } from '../../api/authApi';
import { AuthResponse, LoginPayload, RegisterPayload, StudentProfile, TeacherProfile, User, UserProfileResponse } from '../../types/auth';
import { secureStorage } from '../../utils/secureStorage';

interface AuthState {
  user: User | null;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringAuth: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  studentProfile: null,
  teacherProfile: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringAuth: true,
  error: null,
};

export const login = createAsyncThunk<
  AuthResponse,
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.login(payload);
    await secureStorage.saveToken(res.token);
    return res;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    const msg = error.response?.data?.message || 'Failed to sign in. Please verify your credentials.';
    return rejectWithValue(msg);
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.register(payload);
    await secureStorage.saveToken(res.token);
    return res;
  } catch (err) {
    const error = err as AxiosError<{ message?: string; validationErrors?: Record<string, string> }>;
    const validationMap = error.response?.data?.validationErrors;
    if (validationMap && Object.keys(validationMap).length > 0) {
      const firstKey = Object.keys(validationMap)[0];
      return rejectWithValue(`${firstKey}: ${validationMap[firstKey]}`);
    }
    const msg = error.response?.data?.message || 'Registration failed. Please check your details.';
    return rejectWithValue(msg);
  }
});

export const restoreAuth = createAsyncThunk<
  UserProfileResponse | null,
  void
>('auth/restoreAuth', async () => {
  const token = await secureStorage.getToken();
  if (!token) {
    return null;
  }
  try {
    const me = await authApi.getMe();
    return me;
  } catch (e) {
    await secureStorage.removeToken();
    return null;
  }
});

export const logout = createAsyncThunk<void, void>('auth/logout', async () => {
  await secureStorage.removeToken();
});

export const refreshProfile = createAsyncThunk<
  UserProfileResponse,
  void,
  { rejectValue: string }
>('auth/refreshProfile', async (_, { rejectWithValue }) => {
  try {
    return await authApi.getMe();
  } catch (e) {
    return rejectWithValue('Could not refresh user profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    updateStudentPoints(state, action: PayloadAction<number>) {
      if (state.studentProfile) {
        state.studentProfile.totalPoints = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.studentProfile = action.payload.studentProfile || null;
        state.teacherProfile = action.payload.teacherProfile || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.studentProfile = action.payload.studentProfile || null;
        state.teacherProfile = action.payload.teacherProfile || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Restore Auth
    builder
      .addCase(restoreAuth.pending, (state) => {
        state.isRestoringAuth = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.isRestoringAuth = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.studentProfile = action.payload.studentProfile || null;
          state.teacherProfile = action.payload.teacherProfile || null;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.studentProfile = null;
          state.teacherProfile = null;
          state.token = null;
        }
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.isRestoringAuth = false;
        state.isAuthenticated = false;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.studentProfile = null;
      state.teacherProfile = null;
      state.token = null;
      state.error = null;
    });

    // Refresh Profile
    builder.addCase(refreshProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.studentProfile = action.payload.studentProfile || null;
      state.teacherProfile = action.payload.teacherProfile || null;
    });
  },
});

export const { clearAuthError, updateStudentPoints } = authSlice.actions;
export default authSlice.reducer;

