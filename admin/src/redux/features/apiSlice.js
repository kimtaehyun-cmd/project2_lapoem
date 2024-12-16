import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// API 요청에 사용될 엔드포인트 URL을 import함
import {
  // GET
  GET_BOOK_ALL_CATEGORIES_API_URL,
  GET_BOOK_BY_CATEGORY_API_URL,
  GET_ADMIN_BOOK_LIST_API_URL,
  GET_SEARCH_BOOKS_API_URL,
  GET_BOOK_DETAIL_API_URL,

  // POST
  POST_NEW_BOOKS_API_URL,

  // PATCH
  PATCH_BOOKS_INFO_API_URL,
} from '../../util/apiUrl';

//Request 메서드
import {
  postRequest,
  getRequest,
  patchRequest,
  deleteRequest,
} from '../../util/requestMethods';

//  =======================1. 동적 fetch Thunk 생성기========================
const createApiThunk = (actionType, apiURL, requestMethod) => {
  return createAsyncThunk(actionType, async (params) => {
    const options = {
      method: requestMethod === getRequest ? 'GET' : requestMethod.method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(requestMethod === getRequest ? {} : { body: JSON.stringify(params) }),
      credentials: 'include',
    };
    const url = typeof apiURL === 'function' ? apiURL(params) : apiURL;
    return await requestMethod(url, options);
  });
};

// ========================2. 각 Thunks 정의========================
//    특정 API 요청을 위해 createApiThunk를 호출하여 Thunk 함수 생성

// 책 카테고리 Thunks
export const fetchBookAllCategoriesData = createApiThunk(
  'api/fetchBookAllCategories',
  GET_BOOK_ALL_CATEGORIES_API_URL,
  getRequest
);

// 책 카테고리로 조회 Thunks
export const fetchBookByCategoryData = createApiThunk(
  'api/fetchBookByCategory',
  GET_BOOK_BY_CATEGORY_API_URL,
  getRequest
);

//북 리스트 호출 Thunks
export const fetchAdminBookListData = createApiThunk(
  'api/fetchAdminBookList',
  GET_ADMIN_BOOK_LIST_API_URL,
  getRequest
);
// 키워드 검색 관련 Thunks
export const fetchSearchBooksData = createApiThunk(
  'api/fetchSearchBooks',
  GET_SEARCH_BOOKS_API_URL,
  getRequest
);

// 키워드 검색 관련 Thunks
export const postNewBooksData = createApiThunk(
  'api/postNewBooks',
  POST_NEW_BOOKS_API_URL,
  postRequest
);

// 도서 정보 수정
export const patchBooksInfoData = createApiThunk(
  'api/patchBooksInfo',
  PATCH_BOOKS_INFO_API_URL,
  patchRequest
);

// 도서 상세 정보 get
export const fetchBookDetailData = createApiThunk(
  'api/fetchGetBookDetail',
  async (bookId) => GET_BOOK_DETAIL_API_URL(bookId),
  getRequest
);

//========================3. 비동기 API 호출 처리========================
// fulfilled 상태를 처리하는 핸들러 함수 생성
const handleFullfilled = (stateKey) => (state, action) => {
  if (Array.isArray(action.payload)) {
    state[stateKey] = action.payload;
  } else if (action.payload && typeof action.payload === 'object') {
    state[stateKey] = action.payload.data || action.payload;
  }
  state.isLoading = false;
};

// rejected 상태를 처리하는 핸들러 함수
const handleRejected = (state, action) => {
  state.isLoading = false;
  state.isError = true;
  state.errorMessage = action.error.message;
};

const handlePending = (state) => {
  state.isLoading = true;
  state.isError = false;
  state.errorMessage = '';
};

// ========================4. apiSlice 슬라이스 생성========================
//    Redux 슬라이스를 생성하여 초기 상태와 비동기 액션의 상태 관리 설정
const apiSlice = createSlice({
  name: 'api',
  initialState: {
    fetchBookAllCategories: [],
    fetchAdminBookListt: [],
    fetchSearchBooks: null,
    fetchBookByCategory: null,
    fetchGetBookDetail: null,

    postNewBooks: null,

    patchBooksInfo: null,
    // 기타 초기화

    isLoading: false,
    isError: false,
    errorMessage: '',
  },

  // 비동기 액션을 처리하는 extraReducers 설정
  extraReducers: (builder) => {
    builder
      // ==============도서 카테고리==============
      .addCase(
        fetchBookAllCategoriesData.fulfilled,
        handleFullfilled('fetchBookAllCategories')
      )
      .addCase(fetchBookAllCategoriesData.rejected, handleRejected)
      // ==============도서 카테고리로 조회==============
      .addCase(
        fetchBookByCategoryData.fulfilled,
        handleFullfilled('fetchBookByCategory')
      )
      .addCase(fetchBookByCategoryData.rejected, handleRejected)

      // ==============북 리스트==============
      .addCase(
        fetchAdminBookListData.fulfilled,
        handleFullfilled('fetchAdminBookList')
      )
      .addCase(fetchAdminBookListData.rejected, handleRejected)
      // 북 상세페이지-----------------------------------------------------
      .addCase(
        fetchBookDetailData.fulfilled,
        handleFullfilled('fetchGetBookDetail')
      )
      .addCase(fetchBookDetailData.rejected, handleRejected)
      .addCase(fetchBookDetailData.pending, handlePending)
      // ==============북 키워드 검색==============
      .addCase(
        fetchSearchBooksData.fulfilled,
        handleFullfilled('fetchSearchBooks')
      )
      .addCase(fetchSearchBooksData.rejected, handleRejected)
      // ==============신간 도서 등록==============
      .addCase(postNewBooksData.fulfilled, handleFullfilled('postNewBooks'))
      .addCase(postNewBooksData.rejected, handleRejected)
      // ==============도서 정보 수정==============
      .addCase(patchBooksInfoData.fulfilled, handleFullfilled('patchBooksInfo'))
      .addCase(patchBooksInfoData.rejected, handleRejected);

    // 다른 extraReducers 설정
  },
});

export default apiSlice.reducer;
