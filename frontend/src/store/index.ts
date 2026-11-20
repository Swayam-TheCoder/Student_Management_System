import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './slices/authSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import { setOnUnauthorizedCallback } from '../api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leaderboard: leaderboardReducer,
  },
});

// Configure 401 callback to dispatch logout
setOnUnauthorizedCallback(() => {
  store.dispatch(logout());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

