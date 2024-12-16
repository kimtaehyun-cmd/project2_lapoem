import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import apiSlice from './features/auth/apiSlice';

const store = configureStore({
  // store에 슬라이스 등록
  reducer: {
    auth: authReducer,
    api: apiSlice,
  },
});

export default store;
