// util/apiUrl.js
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://222.112.27.120:8002' // 배포용 URL
    : 'http://localhost:8002'; // 로컬 개발용 URL

// FastAPI 서버의 BASE URL (HTTP API 요청용)
const FASTAPI_HTTP_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://222.112.27.120:9002' // 배포용 HTTP API URL
    : 'http://localhost:9002'; // 로컬 개발용 HTTP API URL

// FastAPI WebSocket URL
const FASTAPI_WEBSOCKET_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'ws://222.112.27.120:9002' // 배포용 WebSocket URL
    : 'ws://localhost:9002'; // 로컬 개발용 WebSocket URL

// ==============================GET 요청 URL=========================================
export const GET_TERMS_API_URL = `${BASE_URL}/terms`; // 약관 목록 조회
export const GET_BOOK_LIST_API_URL = `${BASE_URL}/book-list`; //도서 리스트
export const GET_THREAD_BOOK_LIST_API_URL = `${BASE_URL}/book-list`;
export const GET_BOOK_DETAIL_API_URL = (bookId) =>
  `${BASE_URL}/book-list/${bookId}`; //도서 상세 페이지
export const GET_BOOK_REVIEWS_API_URL = (bookId) =>
  `${BASE_URL}/book-list/${bookId}/reviews`; //도서 리뷰
export const GET_SEARCH_BOOKS_API_URL = `${BASE_URL}/search-books`; //도서 검색
export const GET_BOOK_BY_CATEGORY_API_URL = `${BASE_URL}/search-category`; //도서 필터링 검색
export const GET_BOOK_ALL_CATEGORIES_API_URL = `${BASE_URL}/all-categories`; //도서 전체 카테고리
export const GET_TOP_BOOKS_API_URL = `${BASE_URL}/top-books`; //리뷰, 평점 최고인 책

export const GET_COMMUNITY_POSTS_API_URL = `${BASE_URL}/community`; // 커뮤니티 게시글 목록 조회
export const GET_USER_STATS_API_URL = `${BASE_URL}/user/stats`;
export const GET_HOT_TOPICS_API_URL = `${BASE_URL}/hot-topics`;
export const GET_TOP_USERS_API_URL = `${BASE_URL}/top-users`;
export const GET_NEW_BOOK_API_URL = `${BASE_URL}/new-book`;
export const GET_BEST_BOOK_API_URL = `${BASE_URL}/best-book`;

export const GET_THREADS_API_URL = `${BASE_URL}/threads`;
export const GET_CHECK_THREAD_EXISTENCE_API_URL = (bookId) =>
  `${BASE_URL}/threads/exists/${bookId}`; // 특정 책에 대한 스레드 존재 여부 확인
export const GET_SEARCH_THREADS_API_URL = `${BASE_URL}/search-threads`;
export const GET_THREADS_DETAIL_API_URL = (thread_num) =>
  `${BASE_URL}/threads/${thread_num}`; // 스레드 상세 정보 조회 API URL
export const GET_THREADS_COMMENTS_API_URL = (thread_num) =>
  `${BASE_URL}/threads/${thread_num}/comments`; // 스레드 부모 댓글 목록 조회 API URL
export const GET_COMMENT_REPLIES_API_URL = (parent_content_num) =>
  `${BASE_URL}/comments/${parent_content_num}/replies`; // 대댓글 조회 API URL

//마이페이지
export const GET_MEMBER_INFO_API_URL = (memberNum) =>
  `${BASE_URL}/members/${memberNum}`;
export const UPDATE_MEMBER_INFO_API_URL = (memberNum) =>
  `${BASE_URL}/members/${memberNum}`;

// 리뷰 차트
export const GET_BOOK_REVIEW_DISTRIBUTION_API_URL = (bookId) =>
  `${BASE_URL}/book-list/${bookId}/review-distribution`;

// ==============================POST 요청 URL=========================================
export const JOIN_USER_API_URL = `${BASE_URL}/join`; // 회원 가입 URL
export const LOGIN_USER_API_URL = `${BASE_URL}/login`; // 회원 로그인 URL
export const LOGOUT_USER_API_URL = `${BASE_URL}/logout`; // 회원 로그아웃 URL
export const VERIFY_USER_API_URL = `${BASE_URL}/verify`; // 사용자 인증 확인 URL
export const CREATE_COMMUNITY_POST_API_URL = `${BASE_URL}/community`; // 커뮤니티 새 게시글 작성
export const CREATE_COMMENT_API_URL = `${BASE_URL}/community/comment`; // 댓글 작성 URL
export const CREATE_BOOK_REVIEW_API_URL = (bookId) =>
  `${BASE_URL}/book-list/${bookId}/reviews`; //책 리뷰 작성
export const SAVE_TERMS_AGREEMENT_API_URL = `${BASE_URL}/terms/agreement`; // 약관 동의 내역 저장

export const POST_CREATE_THREAD_API_URL = `${BASE_URL}/threads`;
export const POST_THREAD_COMMENT_API_URL = (thread_num) =>
  `${BASE_URL}/threads/${thread_num}/comment`; // 스레드 댓글 작성 API URL
export const POST_THREAD_REPLY_API_URL = (thread_num, thread_content_num) =>
  `${BASE_URL}/threads/${thread_num}/comment/${thread_content_num}/reply`; // 스레드 대댓글 작성 API URL

// ==============================DELETE 요청 URL=========================================

export const DELETE_COMMENT_API_URL = (commentId) =>
  `${BASE_URL}/community/comment/${commentId}`; // 댓글 삭제 URL
export const DELETE_REVIEW_API_URL = (bookId, reviewId) =>
  `${BASE_URL}/book-list/${bookId}/reviews/${reviewId}`; //리뷰 삭제

export const DELETE_THREAD_COMMENTS_API_URL = (commentId) =>
  `${BASE_URL}/threads/comment/${commentId}`; // 스레드 댓글 및 대댓글 삭제 API URL

export const DELETE_MEMBER_API_URL = (member_num) =>
  `${BASE_URL}/members/${member_num}`;

// ==============================Chat 관련 API URL=========================================
export const API_CHAT_URL = `${FASTAPI_HTTP_BASE_URL}/chat`; // HTTP API URL
export const WEBSOCKET_CHAT_URL = `${FASTAPI_WEBSOCKET_BASE_URL}/ws/chat`; // WebSocket URL
// 채팅방 목록 조회 URL
export const API_CHAT_LIST_URL = (memberNum) =>
  `${FASTAPI_HTTP_BASE_URL}/chat-list/${memberNum}`;
