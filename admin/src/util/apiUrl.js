// util/apiUrl.js
const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://222.112.27.120:8002' // 배포용 URL
    : 'http://localhost:8002'; // 로컬 개발용 URL

// 예시)
// export const GET_TERMS_API_URL = `${BASE_URL}/terms`;

// get
export const GET_BOOK_ALL_CATEGORIES_API_URL = `${BASE_URL}/all-categories`; //도서 전체 카테고리 조회
export const GET_BOOK_BY_CATEGORY_API_URL = `${BASE_URL}/search-category`; //도서 필터링 검색
export const GET_ADMIN_BOOK_LIST_API_URL = `${BASE_URL}/admin/books`; //도서 조회
export const GET_BOOK_DETAIL_API_URL = (bookId) =>
  `${BASE_URL}/book-list/${bookId}`; //도서 상세 정보
export const GET_SEARCH_BOOKS_API_URL = `${BASE_URL}/search-books`; //도서 키워드 검색

// post
export const POST_NEW_BOOKS_API_URL = `${BASE_URL}/new-books`; //신간 도서 등록

// patch
export const PATCH_BOOKS_INFO_API_URL = (book_id) =>
  `${BASE_URL}/books/${book_id}`; //도서 정보 수정
