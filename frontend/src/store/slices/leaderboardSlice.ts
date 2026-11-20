import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { leaderboardApi } from '../../api/leaderboardApi';
import { LeaderboardEntry } from '../../types/leaderboard';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  entries: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

export const fetchLeaderboard = createAsyncThunk<
  { entries: LeaderboardEntry[]; page: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean; append: boolean },
  { page?: number; size?: number; append?: boolean },
  { rejectValue: string }
>('leaderboard/fetchLeaderboard', async ({ page = 0, size = 20, append = false }, { rejectWithValue }) => {
  try {
    const res = await leaderboardApi.getLeaderboard(page, size);
    return {
      entries: res.content,
      page: res.page,
      totalElements: res.totalElements,
      totalPages: res.totalPages,
      hasNext: res.hasNext,
      hasPrevious: res.hasPrevious,
      append,
    };
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Failed to load leaderboard';
    return rejectWithValue(msg);
  }
});

export const refreshLeaderboard = createAsyncThunk<
  { entries: LeaderboardEntry[]; page: number; totalElements: number; totalPages: number; hasNext: boolean; hasPrevious: boolean },
  void,
  { rejectValue: string }
>('leaderboard/refreshLeaderboard', async (_, { rejectWithValue }) => {
  try {
    const res = await leaderboardApi.getLeaderboard(0, 20);
    return {
      entries: res.content,
      page: res.page,
      totalElements: res.totalElements,
      totalPages: res.totalPages,
      hasNext: res.hasNext,
      hasPrevious: res.hasPrevious,
    };
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Failed to refresh leaderboard';
    return rejectWithValue(msg);
  }
});

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    clearLeaderboard(state) {
      state.entries = [];
      state.page = 0;
      state.totalElements = 0;
    },
  },
  extraReducers: (builder) => {
    // fetchLeaderboard
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.append) {
          state.entries = [...state.entries, ...action.payload.entries];
        } else {
          state.entries = action.payload.entries;
        }
        state.page = action.payload.page;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch leaderboard';
      });

    // refreshLeaderboard
    builder
      .addCase(refreshLeaderboard.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshLeaderboard.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.entries = action.payload.entries;
        state.page = action.payload.page;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
      })
      .addCase(refreshLeaderboard.rejected, (state) => {
        state.isRefreshing = false;
      });
  },
});

export const { clearLeaderboard } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;

