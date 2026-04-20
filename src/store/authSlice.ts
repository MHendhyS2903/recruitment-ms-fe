import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient, { setAuthToken } from '../api/axiosClient';
import { withDevMinimumLoadingDuration } from '../utils/devLoadingDelay';
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  UserRole,
} from '../types/auth';

const AUTH_STORAGE_KEY = 'recruitment-auth-session';
const USER_ROLES: UserRole[] = ['SUPER_ADMIN', 'RECRUITER', 'SALES', 'FINANCE'];

interface AuthState {
  error: string;
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
}

const isApiError = (
  value: unknown
): value is {
  response?: {
    data?: {
      error?: { message?: string };
      message?: string;
    };
  };
} =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'response' in value &&
      typeof (value as { response?: unknown }).response === 'object'
  );

const normalizeRole = (value: unknown): UserRole => {
  const normalizedValue =
    typeof value === 'string' ? value.trim().toUpperCase() : '';

  if (USER_ROLES.includes(normalizedValue as UserRole)) {
    return normalizedValue as UserRole;
  }

  return 'SUPER_ADMIN';
};

const normalizeUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = record.id ?? record.userId ?? record.user_id;
  const fullName =
    record.fullName ?? record.full_name ?? record.name ?? record.user_name;
  const email = record.email;

  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    typeof fullName !== 'string' ||
    typeof email !== 'string'
  ) {
    return null;
  }

  return {
    id,
    fullName,
    email,
    role: normalizeRole(record.role),
  };
};

const normalizeSession = (value: unknown): AuthSession | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const container =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : record;
  const token =
    container.token ??
    container.accessToken ??
    container.access_token ??
    record.token ??
    record.accessToken ??
    record.access_token;
  const user = normalizeUser(container.user ?? record.user ?? container);

  if (typeof token !== 'string' || !token.trim() || !user) {
    return null;
  }

  return {
    token: token.trim(),
    user,
  };
};

const readStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return normalizeSession(JSON.parse(rawValue));
  } catch {
    return null;
  }
};

const writeStoredSession = (session: AuthSession | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const initialSession = readStoredSession();
setAuthToken(initialSession?.token ?? null);

export const getDefaultRouteForRole = (role: UserRole) => {
  switch (role) {
    case 'RECRUITER':
      return '/recruiter/todo';
    case 'SALES':
      return '/sales/todo';
    case 'FINANCE':
      return '/master-report';
    case 'SUPER_ADMIN':
    default:
      return '/';
  }
};

export const login = createAsyncThunk<
  AuthSession,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await withDevMinimumLoadingDuration(
      axiosClient.post('/auth/login', credentials)
    );
    const normalizedSession = normalizeSession(response.data);

    if (!normalizedSession) {
      return rejectWithValue('Response login dari API tidak sesuai format yang diharapkan.');
    }

    setAuthToken(normalizedSession.token);
    writeStoredSession(normalizedSession);

    return normalizedSession;
  } catch (error) {
    if (isApiError(error)) {
      const responseError = error.response?.data;
      return rejectWithValue(
        responseError?.error?.message ??
          responseError?.message ??
          'Login gagal. Periksa email, password, atau koneksi backend.'
      );
    }

    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue('Terjadi kendala saat login.');
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      if (isApiError(error)) {
        const responseError = error.response?.data;
        const message =
          responseError?.error?.message ??
          responseError?.message ??
          'Logout backend gagal, tetapi session lokal tetap dibersihkan.';

        setAuthToken(null);
        writeStoredSession(null);
        return rejectWithValue(message);
      }
    }

    setAuthToken(null);
    writeStoredSession(null);
  }
);

const initialState: AuthState = {
  error: '',
  isAuthenticated: Boolean(initialSession),
  loading: false,
  user: initialSession?.user ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = '';
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login gagal. Silakan coba lagi.';
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.error = '';
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? '';
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
