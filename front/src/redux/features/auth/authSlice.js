import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  JOIN_USER_API_URL,
  LOGIN_USER_API_URL,
  LOGOUT_USER_API_URL,
  VERIFY_USER_API_URL,
} from '../../../util/apiUrl';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoggedIn: !!localStorage.getItem('user'),
  isAuthInitializing: false,
  authInitialized: false, // auth 초기화 완료 여부 상태 추가
  error: null,
  message: null,
};

// 회원가입
export const joinUser = createAsyncThunk(
  'auth/joinUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(JOIN_USER_API_URL, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '회원가입 오류');
    }
  }
);

// 로그인
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(LOGIN_USER_API_URL, loginData, {
        withCredentials: true,
      });
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData)); // 로컬 스토리지에 사용자 정보 저장
      return userData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '로그인 오류');
    }
  }
);

// 새로고침 시 로그인 상태 초기화
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        return storedUser; // 로컬 스토리지에 저장된 사용자 정보를 반환
      } else {
        const response = await axios.get(VERIFY_USER_API_URL, {
          withCredentials: true,
        });
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData)); // 로컬 스토리지에 사용자 정보 저장
        return userData;
      }
    } catch (error) {
      return rejectWithValue('Token verification failed');
    }
  }
);

// 로그아웃
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async ({ isDelete = false } = {}, { rejectWithValue }) => {
    try {
      await axios.post(LOGOUT_USER_API_URL, {}, { withCredentials: true });
      localStorage.removeItem('user'); // 로컬 스토리지에서 사용자 정보 제거
      return isDelete ? '탈퇴가 완료되었습니다.' : '로그아웃되었습니다.';
    } catch (error) {
      console.error('Logout failed:', error);
      return rejectWithValue('Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null; // 메시지 초기화
    },
    clearError: (state) => {
      state.error = null; // 에러 초기화
    },
    updateNickname: (state, action) => {
      if (state.user) {
        state.user.nickname = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.user = null;
        state.isLoggedIn = false;
        state.authInitialized = false;
        state.message = action.payload; // 로그아웃 또는 탈퇴 메시지 설정
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('User data received in fulfilled:', action.payload.user);
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.error = null;

        // 로그인 성공 후 인증 상태 초기화
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        state.isAuthInitializing = true; // 초기화 중 상태로 설정

        console.log('User data saved in Redux state:', state.user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.user = null; // 로그인 실패 시 사용자 정보 초기화
        state.isLoggedIn = false; // 로그인 상태 초기화
        state.isAuthInitializing = false; // 초기화 상태를 false로 변경
        state.authInitialized = false; // 초기화 완료 상태도 false로 설정
      })
      .addCase(initializeAuth.pending, (state) => {
        state.isAuthInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.isAuthInitializing = false;
        state.authInitialized = true; // 초기화 완료 상태로 변경
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.isAuthInitializing = false;
        state.authInitialized = true; // 실패한 경우에도 초기화 완료 상태로 설정
      });
  },
});

export const { clearMessage, updateNickname, clearError } = authSlice.actions;
export default authSlice.reducer;
