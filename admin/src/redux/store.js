import { configureStore } from '@reduxjs/toolkit';
import apiSlice from './features/apiSlice.js';

const store = configureStore({
  // store에 슬라이스 등록
  reducer: {
    api: apiSlice,
  },
});

export default store;
