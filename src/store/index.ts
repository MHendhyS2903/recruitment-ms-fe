import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import interviewsReducer from './interviewsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    interviews: interviewsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
