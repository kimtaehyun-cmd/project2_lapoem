import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GET_ADMIN_BOOK_LIST_API_URL,
  GET_BOOK_BY_CATEGORY_API_URL,
  GET_SEARCH_BOOKS_API_URL,
  PATCH_BOOKS_INFO_API_URL,
} from '../../util/apiUrl';
import Searchbar from './Searchbar';
import CategoryFilter from './CategoryFilter';
import Pagination from '../common/Pagination';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // 검색어 상태 추가
  const [noResults, setNoResults] = useState(false); // 검색 결과가 없을 때 메시지 표시 상태 추가

  useEffect(() => {
    if (searchKeyword) {
      fetchSearchResults(currentPage, searchKeyword); // 검색어가 있을 때는 검색 API 호출
    } else {
      fetchBooks(currentPage, selectedCategory); // 그렇지 않을 경우 일반 목록 API 호출
    }
  }, [currentPage, selectedCategory, searchKeyword]);

  const fetchBooks = async (page, genre_tag_id) => {
    setLoading(true);
    setNoResults(false); // 새로운 요청 시 noResults 초기화
    try {
      const apiUrl = genre_tag_id
        ? GET_BOOK_BY_CATEGORY_API_URL
        : GET_ADMIN_BOOK_LIST_API_URL;
      const response = await axios.get(apiUrl, {
        params: { page, limit, genre_tag_id },
      });
      setBooks(response.data.data);
      setTotalBooks(response.data.totalBooks);
      setNoResults(response.data.data.length === 0); // 결과가 없으면 noResults를 true로 설정
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 결과를 처리하는 함수
  const handleSearch = (data, keyword) => {
    setBooks(data.data);
    setTotalBooks(data.totalBooks);
    setCurrentPage(1); // 검색 시 페이지를 1로 초기화
    setSelectedCategory(''); // 검색 시 선택된 카테고리 초기화
    setSearchKeyword(keyword); // 검색어 상태 업데이트
    setNoResults(data.data.length === 0); // 검색 결과가 없으면 noResults를 true로 설정
  };

  const fetchSearchResults = async (page, keyword) => {
    setLoading(true);
    setNoResults(false); // 새로운 요청 시 noResults 초기화
    try {
      const response = await axios.get(GET_SEARCH_BOOKS_API_URL, {
        params: { keyword, page, limit },
      });
      setBooks(response.data.data);
      setTotalBooks(response.data.totalBooks);
      setNoResults(response.data.data.length === 0); // 결과가 없으면 noResults를 true로 설정
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchKeyword(''); // 카테고리 변경 시 검색어 초기화
    setNoResults(false); // 카테고리 변경 시 검색 결과 메시지 초기화
  };

  const totalPages = Math.ceil(totalBooks / limit);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleBestSeller = async (bookId, currentStatus) => {
    // 상태에 따라 알림 메시지 내용 변경
    const message = currentStatus
      ? '해당 도서를 베스트셀러에서 제외하시겠습니까?'
      : '해당 도서를 베스트셀러로 지정하시겠습니까?';

    // 확인 및 취소 버튼을 가진 알림창
    if (window.confirm(message)) {
      try {
        const newStatus = !currentStatus;
        await axios.patch(PATCH_BOOKS_INFO_API_URL(bookId), {
          book_id: bookId, // book_id 추가
          is_book_best: newStatus,
        });
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.book_id === bookId
              ? { ...book, is_book_best: newStatus }
              : book
          )
        );
      } catch (error) {
        console.error('Error updating best seller status:', error);
      }
    }
  };

  const toggleBookStatus = async (bookId, currentStatus) => {
    // currentStatus가 null일 경우 true로 간주
    const actualStatus = currentStatus === null || currentStatus === true;

    // 상태에 따라 알림 메시지 내용 변경
    const message = actualStatus
      ? '해당 도서를 숨김 처리 하시겠습니까?'
      : '해당 도서를 활성화 하시겠습니까?';

    // 확인 및 취소 버튼을 가진 알림창
    if (window.confirm(message)) {
      try {
        const newStatus = !actualStatus;
        await axios.patch(PATCH_BOOKS_INFO_API_URL(bookId), {
          book_id: bookId, // book_id 추가
          book_status: newStatus, // book_status 상태 변경
        });
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.book_id === bookId ? { ...book, book_status: newStatus } : book
          )
        );
      } catch (error) {
        console.error('Error updating book status:', error);
      }
    }
  };

  return (
    <div className="booklist_container">
      <div className="booklist_search">
        <CategoryFilter onCategoryChange={handleCategoryChange} />
        <Searchbar apiUrl={GET_SEARCH_BOOKS_API_URL} onSearch={handleSearch} />
      </div>
      {/* <div className="delete_all_books">
        <button>선택 사항 삭제</button>
      </div> */}
      <div className="book_contianer_main_tap">
        <span>ID</span>
        <span>책 목록</span>
        <span>리뷰</span>
        <span>평점</span>
        <span>등록날짜</span>
        <span>베스트셀러 여부</span>
        <span>상태</span>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : noResults ? ( // 검색 결과가 없을 경우 메시지 표시
        <p className="no-results-message">검색된 결과가 없습니다.</p>
      ) : (
        <div className="booklist_wrapper">
          <div className="booklist_content">
            <div className="booklist_contnet">
              {books.map((book, index) => (
                <div key={book.book_id}>
                  <div className="book_list_item">
                    {/* <span key={book.genre_tag_id}></span> */}
                    <span> {book.book_id}</span>
                    <span className="book_title">{book.book_title}</span>
                    <span>{book.review_count} 개</span>
                    <span>{book.average_rating}</span>
                    <span>{book.book_create_date}</span>
                    {/* is_book_best 토글 버튼 */}
                    <span
                      style={{
                        cursor: 'pointer',
                        color: book.is_book_best ? 'blue' : 'black',
                      }}
                      onClick={() =>
                        toggleBestSeller(book.book_id, book.is_book_best)
                      }
                    >
                      {book.is_book_best ? 'true' : 'false'}
                    </span>
                    <span
                      style={{
                        cursor: 'pointer',
                        color:
                          book.book_status === null || book.book_status
                            ? 'blue'
                            : 'gray', // null일 때도 blue로 표시
                      }}
                      onClick={() =>
                        toggleBookStatus(book.book_id, book.book_status)
                      }
                    >
                      {book.book_status === null || book.book_status
                        ? '활성'
                        : '숨김'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;
