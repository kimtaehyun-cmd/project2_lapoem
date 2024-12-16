import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// API 요청에 사용될 엔드포인트 URL을 import함
import {
  //get
  GET_BOOK_LIST_API_URL,
  GET_THREAD_BOOK_LIST_API_URL,
  GET_BOOK_REVIEWS_API_URL,
  GET_BOOK_DETAIL_API_URL,
  GET_SEARCH_BOOKS_API_URL,
  GET_BOOK_BY_CATEGORY_API_URL,
  GET_BOOK_ALL_CATEGORIES_API_URL,
  GET_NEW_BOOK_API_URL,
  GET_BEST_BOOK_API_URL,
  GET_COMMUNITY_POSTS_API_URL,
  GET_USER_STATS_API_URL,
  GET_HOT_TOPICS_API_URL,
  GET_TOP_USERS_API_URL,
  GET_THREADS_API_URL,
  GET_CHECK_THREAD_EXISTENCE_API_URL,
  GET_SEARCH_THREADS_API_URL,
  GET_MEMBER_INFO_API_URL,
  UPDATE_MEMBER_INFO_API_URL,
  GET_TOP_BOOKS_API_URL,
  GET_BOOK_REVIEW_DISTRIBUTION_API_URL,

  //post
  CREATE_COMMUNITY_POST_API_URL,
  CREATE_COMMENT_API_URL,
  CREATE_BOOK_REVIEW_API_URL,
  POST_CREATE_THREAD_API_URL,

  //delete
  DELETE_COMMENT_API_URL,
  DELETE_REVIEW_API_URL,
  GET_THREADS_DETAIL_API_URL,
  GET_THREADS_COMMENTS_API_URL,
  POST_THREAD_COMMENT_API_URL,
  POST_THREAD_REPLY_API_URL,
  DELETE_THREAD_COMMENTS_API_URL,
  DELETE_MEMBER_API_URL,
} from '../../../util/apiUrl';

import {
  postRequest,
  getRequest,
  patchRequest,
  deleteRequest,
} from '../../../util/requestMethods';

//  =======================1. 동적 fetch Thunk 생성기========================
//    actionType (예: fetchGetBookList)
//    apiURL - 엔드포인트 URL
//    requestMethod - HTTP 요청 함수 (예: getRequest)
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

//북 리스트 관련 Thunks
export const fetchBookListData = createApiThunk(
  'api/fetchGetBookList',
  GET_BOOK_LIST_API_URL,
  getRequest
);

// 스레드 북리스트
export const fetchThreadBookListData = createApiThunk(
  'api/api/fetchThreadBookList',
  GET_THREAD_BOOK_LIST_API_URL,
  getRequest
);

// 평점 리뷰 최고인 책
export const fetchTopBooksData = createApiThunk(
  'api/fetchTopBooks',
  GET_TOP_BOOKS_API_URL,
  getRequest
);

// 북 상세페이지 Thunks
export const fetchBookDetailData = createApiThunk(
  'api/fetchGetBookDetail',
  async (bookId) => GET_BOOK_DETAIL_API_URL(bookId),
  getRequest
);

// 북 리뷰 Thunks
export const fetchBookReviewsData = createApiThunk(
  'api/fetchGetBookReviews',
  async (bookId) => GET_BOOK_REVIEWS_API_URL(bookId),
  getRequest
);

// 북 리뷰 작성 Thunks
export const fetchCreateReviewData = createApiThunk(
  'api/fetchCreateReview',
  async (bookId) => CREATE_BOOK_REVIEW_API_URL(bookId),
  postRequest
);

//북 리뷰 삭제 썬크
export const fetchDeleteReviewData = createApiThunk(
  'api/fetchDeleteReview',
  async (bookId, reviewId) => DELETE_REVIEW_API_URL(bookId, reviewId),
  deleteRequest
);

// 검색 관련 Thunks
export const fetchSearchBooksData = createApiThunk(
  'api/fetchSearchBooks',
  GET_SEARCH_BOOKS_API_URL,
  getRequest
);

// 카테고리 필터 조회 Thunks
export const fetchBookByCategoryData = createApiThunk(
  'api/fetchBookByCategory',
  GET_BOOK_BY_CATEGORY_API_URL,
  getRequest
);

// 책 카테고리 Thunks
export const fetchBookAllCategoriesData = createApiThunk(
  'api/fetchBookAllCategories',
  GET_BOOK_ALL_CATEGORIES_API_URL,
  getRequest
);

// 신간 도서 불러오기 Thunks
export const fetchNewBookData = createApiThunk(
  'api/fetchNewBook',
  GET_NEW_BOOK_API_URL,
  getRequest
);

// 베스트셀러 불러오기 Thunks
export const fetchBestBookData = createApiThunk(
  'api/fetchBestBook',
  GET_BEST_BOOK_API_URL,
  getRequest
);

// 커뮤니티 게시글 가져오기 Thunk
export const fetchCommunityPostsData = createAsyncThunk(
  'api/fetchCommunityPosts',
  async ({ viewType, member_num }, { rejectWithValue }) => {
    const visibility = viewType === 'Only me' ? 'false' : 'true';
    const url = `${GET_COMMUNITY_POSTS_API_URL}?visibility=${visibility}${
      member_num ? `&member_num=${member_num}` : ''
    }`;

    console.log(
      'Requesting posts with visibility:',
      visibility,
      'and member_num:',
      member_num
    );

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(
          'Failed to fetch posts:',
          response.status,
          response.statusText
        );
        return rejectWithValue('Failed to fetch posts');
      }

      const data = await response.json();
      console.log('Fetched posts data:', data); // 서버로부터 받아온 데이터 확인
      return data;
    } catch (error) {
      console.error('Network error:', error);
      return rejectWithValue('Network error');
    }
  }
);

// 커뮤니티 새 게시글 생성 Thunk
export const createCommunityPostData = createAsyncThunk(
  'api/createCommunityPost',
  async (postData, { getState, rejectWithValue }) => {
    try {
      // 현재 로그인한 사용자 정보에서 member_num 가져오기
      const { auth } = getState();
      const member_num = auth.user?.memberNum;

      // member_num이 postData에 포함되지 않은 경우 추가
      const requestData = {
        ...postData,
        member_num: postData.member_num || member_num,
      };

      console.log('Sending post data to server:', requestData); // 서버에 보내는 데이터 확인

      // postRequest 함수 호출
      const data = await postRequest(
        CREATE_COMMUNITY_POST_API_URL,
        requestData
      );

      // 성공적인 요청 처리
      console.log('Post created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating post:', error.message);
      return rejectWithValue(
        error.message || 'Network error or failed to parse response.'
      );
    }
  }
);

// 게시글 수정 Thunk
export const updateCommunityPostData = createAsyncThunk(
  'api/updateCommunityPost',
  async ({ postId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await patchRequest(
        `${GET_COMMUNITY_POSTS_API_URL}/${postId}`,
        updatedData
      );

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 게시글 삭제 Thunk
export const deleteCommunityPostData = createAsyncThunk(
  'api/deleteCommunityPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${GET_COMMUNITY_POSTS_API_URL}/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      return postId; // 삭제된 게시글의 ID 반환
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 커뮤니티 댓글 생성 Thunk
export const addCommentToPost = createAsyncThunk(
  'api/addCommentToPost',
  async (commentData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const member_num = auth.user?.memberNum;

      // member_num이 commentData에 포함되지 않은 경우 추가
      const requestData = {
        ...commentData,
        member_num: commentData.member_num || member_num,
      };

      console.log('Sending comment data to server:', requestData); // 서버에 보내는 데이터 확인

      // 서버에 전송할 때 member_num이 포함되어 있는지 확인하세요.
      if (!requestData.member_num) {
        console.error('Error: member_num is missing in requestData');
      }

      // postRequest 함수 호출
      const data = await postRequest(CREATE_COMMENT_API_URL, requestData);
      return data;
    } catch (error) {
      console.error('Error creating comment:', error.message);
      return rejectWithValue(
        error.message || 'Network error or failed to parse response.'
      );
    }
  }
);

// 댓글 목록 가져오기 Thunk
export const fetchCommentsByPostId = createAsyncThunk(
  'community/fetchCommentsByPostId',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${GET_COMMUNITY_POSTS_API_URL}/${postId}/comments`
      );

      if (response.status === 404) {
        // 댓글이 없는 경우 빈 배열 반환
        return [];
      }

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 댓글 삭제 Thunk
export const deleteCommentData = createAsyncThunk(
  'community/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await fetch(DELETE_COMMENT_API_URL(commentId), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('댓글 삭제에 실패했습니다.');
      }

      return commentId; // 삭제된 댓글 ID 반환
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCommunityPostDetail = createAsyncThunk(
  'community/fetchPostDetail',
  async (postId, thunkAPI) => {
    try {
      const response = await fetch(`${GET_COMMUNITY_POSTS_API_URL}/${postId}`);

      // 응답이 JSON 형식이 아니면 에러 던지기
      const contentType = response.headers.get('content-type');
      if (
        !response.ok ||
        !contentType ||
        !contentType.includes('application/json')
      ) {
        throw new Error(
          'Failed to fetch post details or invalid response format'
        );
      }

      const data = await response.json();
      console.log('Fetched Post Detail:', data); // 서버로부터 받아온 데이터 확인
      return data; // 단일 게시글 반환
    } catch (error) {
      console.error('Error fetching post details:', error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// 사용자 통계 가져오기 Thunk
export const fetchUserStats = createAsyncThunk(
  'api/fetchUserStats',
  async (memberNum, { rejectWithValue }) => {
    try {
      // 여기서 memberNum이 객체가 아닌 숫자나 문자열인지 확인하세요.
      console.log('Member number passed to fetchUserStats:', memberNum);
      if (typeof memberNum !== 'number' && typeof memberNum !== 'string') {
        throw new Error('Invalid member number provided');
      }

      const response = await getRequest(
        `${GET_USER_STATS_API_URL}?member_num=${memberNum}`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return rejectWithValue('Failed to fetch user stats');
    }
  }
);

export const fetchHotTopics = createAsyncThunk(
  'api/fetchHotTopics',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await getRequest(
        `${GET_HOT_TOPICS_API_URL}?limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch hot topics:', error);
      return rejectWithValue('Failed to fetch hot topics');
    }
  }
);

export const fetchTopUsers = createAsyncThunk(
  'api/fetchTopUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequest(GET_TOP_USERS_API_URL);
      return response;
    } catch (error) {
      console.error('Failed to fetch top users:', error);
      return rejectWithValue('Failed to fetch top users');
    }
  }
);

// thread 관련 Thunks
export const fetchThreadsData = createApiThunk(
  'api/fetchThreads',
  GET_THREADS_API_URL,
  getRequest
);

export const checkThreadExistence = createApiThunk(
  'api/checkThreadExistence',
  async (bookId) => GET_CHECK_THREAD_EXISTENCE_API_URL(bookId),
  getRequest
);

export const searchThreadsData = createApiThunk(
  'api/searchThreads',
  GET_SEARCH_THREADS_API_URL,
  getRequest
);

export const createThreadData = createApiThunk(
  'api/createThread',
  POST_CREATE_THREAD_API_URL,
  postRequest
);

export const fetchThreadDetailData = createApiThunk(
  'api/fetchThreadDetail',
  async (thread_num) => GET_THREADS_DETAIL_API_URL(thread_num),
  getRequest
); // 스레드 상세 정보 조회

export const fetchThreadCommentsData = createApiThunk(
  'api/fetchThreadComments',
  async (thread_num) => GET_THREADS_COMMENTS_API_URL(thread_num),
  getRequest
); // 스레드 댓글 목록 조회

export const createThreadCommentData = createApiThunk(
  'api/createThreadComment',
  async (thread_num) => POST_THREAD_COMMENT_API_URL(thread_num),
  postRequest
); // 스레드 댓글 추가

export const createThreadReplyData = createApiThunk(
  'api/createThreadReply',
  async (thread_num, thread_content_num) =>
    POST_THREAD_REPLY_API_URL(thread_num, thread_content_num),
  postRequest
); // 스레드 대댓글 추가

export const deleteThreadCommentData = createApiThunk(
  'api/deleteThreadComment',
  async (commentId) => DELETE_THREAD_COMMENTS_API_URL(commentId),
  deleteRequest
); // 스레드 댓글 및 대댓글 삭제

// 마이페이지
export const getMemberInfoData = createApiThunk(
  'api/getMemberInfo',
  (memberNum) => GET_MEMBER_INFO_API_URL,
  getRequest
);

export const updateMemberInfoData = createApiThunk(
  'api/updateMemberInfo',
  (memberNum) => UPDATE_MEMBER_INFO_API_URL,
  patchRequest
);

// 회원탈퇴
export const fetchDeleteMemberData = createApiThunk(
  'api/fetchDeleteMember',
  (member_num) => DELETE_MEMBER_API_URL(member_num),
  deleteRequest
);

// 리뷰 분포 데이터 가져오기 Thunk
export const fetchBookReviewDistributionData = createApiThunk(
  'api/fetchBookReviewDistribution',
  async (bookId) => GET_BOOK_REVIEW_DISTRIBUTION_API_URL(bookId),
  getRequest
);

// 다른 관련 Thunks생성

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
    userStats: {
      totalPosts: null,
      totalComments: null,
    },
    hotTopics: [],
    topUsers: [],
    fetchGetBookList: [],
    fetchTopBooks: [],
    fetchGetBookDetail: null,
    fetchGetBookReviews: [],
    fetchDeleteReview: null,
    fetchSearchBooks: null,
    fetchBookByCategory: null,
    fetchBookAllCategories: [],
    fetchNewBookData: [],
    fetchBestBookData: [],
    fetchCommunityPosts: [],
    postDetail: null,
    comments: [], // 초기 상태를 빈 배열로 설정
    createCommunityPost: null,
    fetchCreateReview: null,
    addComment: null,
    fetchThreadsData: [],
    checkThreadExistence: null,
    searchThreadsData: [],
    createThreadData: null,
    //마이페이지
    getMemberInfo: null,
    updateMemberInfo: null,
    // 새로운 thread 관련 상태 추가
    fetchThreadDetailData: null,
    fetchThreadCommentsData: [],
    createThreadCommentData: null,
    createThreadReplyData: null,
    deleteThreadCommentData: null,
    fetchDeleteMember: null,
    reviewDistribution: {},
    isLoading: false,
    isError: false,
    errorMessage: '',
  },

  // 비동기 액션을 처리하는 extraReducers 설정
  extraReducers: (builder) => {
    builder
      // 북 리스트 -----------------------------------------------------
      .addCase(
        fetchBookListData.fulfilled,
        handleFullfilled('fetchGetBookList')
      )
      .addCase(fetchBookListData.rejected, handleRejected)
      // 스레드 북 리스트 -----------------------------------------------------
      .addCase(
        fetchThreadBookListData.fulfilled,
        handleFullfilled('fetchThreadBookList')
      )
      .addCase(fetchThreadBookListData.rejected, handleRejected)
      // 평점 리뷰 최고인 책 -----------------------------------------------------
      .addCase(fetchTopBooksData.fulfilled, handleFullfilled('fetchTopBooks'))
      .addCase(fetchTopBooksData.rejected, handleRejected)
      // 북 리뷰-----------------------------------------------------
      .addCase(
        fetchBookReviewsData.fulfilled,
        handleFullfilled('fetchGetBookReviews')
      )
      .addCase(fetchBookReviewsData.rejected, handleRejected)

      // 북 리뷰 작성-----------------------------------------------------
      .addCase(
        fetchCreateReviewData.fulfilled,
        handleFullfilled('fetchCreateReview')
      )
      .addCase(fetchCreateReviewData.rejected, handleRejected)
      //북 리뷰 삭제------------------------------------------------------
      .addCase(
        fetchDeleteReviewData.fulfilled,
        handleFullfilled('fetchDeleteReview')
      )
      .addCase(fetchDeleteReviewData.rejected, handleRejected)
      // 북 상세페이지-----------------------------------------------------
      .addCase(
        fetchBookDetailData.fulfilled,
        handleFullfilled('fetchGetBookDetail')
      )
      .addCase(fetchBookDetailData.rejected, handleRejected)
      .addCase(fetchBookDetailData.pending, handlePending)
      // -----------------------------------------------------
      .addCase(
        fetchSearchBooksData.fulfilled,
        handleFullfilled('fetchSearchBooks')
      )
      .addCase(fetchSearchBooksData.rejected, handleRejected)

      .addCase(
        fetchBookByCategoryData.fulfilled,
        handleFullfilled('fetchBookByCategory')
      )
      .addCase(fetchBookByCategoryData.rejected, handleRejected)

      .addCase(
        fetchBookAllCategoriesData.fulfilled,
        handleFullfilled('fetchBookAllCategories')
      )
      .addCase(fetchBookAllCategoriesData.rejected, handleRejected)

      .addCase(fetchNewBookData.fulfilled, handleFullfilled('fetchNewBookData'))
      .addCase(fetchNewBookData.rejected, handleRejected)

      .addCase(
        fetchBestBookData.fulfilled,
        handleFullfilled('fetchBestBookData')
      )
      .addCase(fetchBestBookData.rejected, handleRejected)
      // 여기부터 사이드바 처리
      .addCase(fetchUserStats.pending, handlePending)
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload; // 사용자 통계를 상태에 저장
        state.isLoading = false;
      })
      .addCase(fetchUserStats.rejected, handleRejected)
      // 핫토픽 가져오기
      .addCase(fetchHotTopics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHotTopics.fulfilled, (state, action) => {
        state.hotTopics = action.payload; // 핫토픽 데이터 저장
        state.isLoading = false;
      })
      .addCase(fetchHotTopics.rejected, (state, action) => {
        state.isError = true;
        state.errorMessage = action.payload;
        state.isLoading = false;
      })
      // 상위 사용자 가져오기
      .addCase(fetchTopUsers.pending, handlePending)
      .addCase(fetchTopUsers.fulfilled, (state, action) => {
        state.topUsers = action.payload; // 상위 사용자 데이터를 상태에 저장
        state.isLoading = false;
      })
      .addCase(fetchTopUsers.rejected, handleRejected)

      // 여기부터 커뮤니티 게시글 처리
      .addCase(
        fetchCommunityPostsData.fulfilled,
        handleFullfilled('fetchCommunityPosts')
      )
      .addCase(fetchCommunityPostsData.rejected, handleRejected)

      .addCase(
        createCommunityPostData.fulfilled,
        handleFullfilled('createCommunityPost')
      )
      .addCase(createCommunityPostData.rejected, handleRejected)

      .addCase(fetchCommunityPostDetail.pending, handlePending)
      .addCase(
        fetchCommunityPostDetail.fulfilled,
        handleFullfilled('postDetail')
      )
      .addCase(fetchCommunityPostDetail.rejected, handleRejected)

      // 댓글 목록 가져오기 처리
      .addCase(fetchCommentsByPostId.pending, handlePending)
      .addCase(fetchCommentsByPostId.fulfilled, (state, action) => {
        state.comments = action.payload; // 댓글 목록 상태 업데이트
        state.isLoading = false;
      })
      .addCase(fetchCommentsByPostId.rejected, handleRejected)

      // 댓글 추가 처리
      .addCase(addCommentToPost.pending, handlePending)
      .addCase(addCommentToPost.fulfilled, (state, action) => {
        state.comments.push(action.payload); // comments 배열에 새 댓글 추가
        state.isLoading = false;
      })
      .addCase(addCommentToPost.rejected, handleRejected)
      .addCase(updateCommunityPostData.pending, handlePending)
      .addCase(updateCommunityPostData.fulfilled, (state, action) => {
        // 수정된 게시글을 postDetail에 업데이트
        if (
          state.postDetail &&
          state.postDetail.posts_id === action.payload.posts_id
        ) {
          state.postDetail = { ...state.postDetail, ...action.payload };
        }
        state.isLoading = false;
      })
      .addCase(updateCommunityPostData.rejected, handleRejected)
      .addCase(deleteCommunityPostData.pending, handlePending)
      .addCase(deleteCommunityPostData.fulfilled, (state, action) => {
        // 삭제된 게시글을 커뮤니티 목록에서 제거
        state.fetchCommunityPosts = state.fetchCommunityPosts.filter(
          (post) => post.posts_id !== action.payload
        );
        state.isLoading = false;
      })
      .addCase(deleteCommunityPostData.rejected, handleRejected)
      .addCase(deleteCommentData.pending, handlePending)
      .addCase(deleteCommentData.fulfilled, (state, action) => {
        state.comments = state.comments.filter(
          (comment) => comment.comment_id !== action.payload
        );
        state.isLoading = false;
      })
      .addCase(deleteCommentData.rejected, handleRejected)
      // -----------------------------------------------------여기까지 커뮤니티

      // Thread 관련 처리
      .addCase(fetchThreadsData.fulfilled, handleFullfilled('fetchThreadsData'))
      .addCase(fetchThreadsData.rejected, handleRejected)
      .addCase(fetchThreadsData.pending, handlePending)

      .addCase(
        checkThreadExistence.fulfilled,
        handleFullfilled('checkThreadExistence')
      )
      .addCase(checkThreadExistence.rejected, handleRejected)
      .addCase(checkThreadExistence.pending, handlePending)

      .addCase(
        searchThreadsData.fulfilled,
        handleFullfilled('searchThreadsData')
      )
      .addCase(searchThreadsData.rejected, handleRejected)
      .addCase(searchThreadsData.pending, handlePending)

      .addCase(createThreadData.fulfilled, handleFullfilled('createThreadData'))
      .addCase(createThreadData.rejected, handleRejected)
      .addCase(createThreadData.pending, handlePending)

      // 추가된 Thread 상세, 댓글 관련 처리
      .addCase(
        fetchThreadDetailData.fulfilled,
        handleFullfilled('fetchThreadDetailData')
      )
      .addCase(fetchThreadDetailData.rejected, handleRejected)
      .addCase(fetchThreadDetailData.pending, handlePending)

      .addCase(
        fetchThreadCommentsData.fulfilled,
        handleFullfilled('fetchThreadCommentsData')
      )
      .addCase(fetchThreadCommentsData.rejected, handleRejected)
      .addCase(fetchThreadCommentsData.pending, handlePending)

      .addCase(
        createThreadCommentData.fulfilled,
        handleFullfilled('createThreadCommentData')
      )
      .addCase(createThreadCommentData.rejected, handleRejected)
      .addCase(createThreadCommentData.pending, handlePending)

      .addCase(
        createThreadReplyData.fulfilled,
        handleFullfilled('createThreadReplyData')
      )
      .addCase(createThreadReplyData.rejected, handleRejected)
      .addCase(createThreadReplyData.pending, handlePending)

      .addCase(
        deleteThreadCommentData.fulfilled,
        handleFullfilled('deleteThreadCommentData')
      )
      .addCase(deleteThreadCommentData.rejected, handleRejected)
      .addCase(deleteThreadCommentData.pending, handlePending)
      // ------------------------------------------------------ Thread

      // 마이페이지 -----------------------------------------------------
      .addCase(getMemberInfoData.fulfilled, handleFullfilled('getMemberInfo'))
      .addCase(getMemberInfoData.rejected, handleRejected)

      .addCase(
        updateMemberInfoData.fulfilled,
        handleFullfilled('updateMemberInfo')
      )
      .addCase(updateMemberInfoData.rejected, handleRejected)

      //  회원삭제 -----------------------------------------------------
      .addCase(
        fetchDeleteMemberData.fulfilled,
        handleFullfilled('fetchDeleteMember')
      )
      .addCase(fetchDeleteMemberData.rejected, handleRejected)

      // 리뷰 분포 데이터 가져오기 처리
      .addCase(fetchBookReviewDistributionData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookReviewDistributionData.fulfilled, (state, action) => {
        state.reviewDistribution = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchBookReviewDistributionData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });

    // 다른 extraReducers 설정
  },
});

export default apiSlice.reducer;
