import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

import {
  GET_BOOK_BY_CATEGORY_API_URL,
  GET_THREAD_BOOK_LIST_API_URL,
  GET_SEARCH_BOOKS_API_URL,
  GET_CHECK_THREAD_EXISTENCE_API_URL,
  POST_CREATE_THREAD_API_URL,
} from '../../util/apiUrl';

import SearchBar from '../Common/SearchBar';
import CategoryFilter from '../Common/CategoryFilter';
import Pagination from '../PageNation';
import BookCard from '../Bookcard';

import './Threadon_post.css';

import small_star from '../../assets/images/small_star.png';

const Threadon_post = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [limit] = useState(5); // 페이지당 표시할 책의 수, 검색 시에도 5개로 제한
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // 검색어 상태 추가

  const [selectedBook, setSelectedBook] = useState(null); // 선택된 도서 상태 추가

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [threadComment, setThreadComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const memberNum = useSelector((state) => state.auth.user?.memberNum); // Redux에서 memberNum 가져오기

  useEffect(() => {
    console.log(
      'Current Page:',
      currentPage,
      'Selected Category:',
      selectedCategory,
      'Search Keyword:',
      searchKeyword
    );
    fetchBooks(currentPage, selectedCategory, searchKeyword);
  }, [currentPage, selectedCategory]);

  const fetchBooks = async (page, genre_tag_id, keyword) => {
    setLoading(true);
    try {
      const apiUrl = keyword
        ? GET_SEARCH_BOOKS_API_URL // 검색어가 있을 경우 검색 API 사용
        : genre_tag_id
        ? GET_BOOK_BY_CATEGORY_API_URL // 카테고리가 있을 경우 카테고리 API 사용
        : GET_THREAD_BOOK_LIST_API_URL; // 기본 전체 목록 API

      const params = keyword
        ? { page, limit, keyword }
        : { page, limit, genre_tag_id };
      console.log('Fetching books with params:', params, 'Using API:', apiUrl); // 디버깅용 콘솔로그

      const response = await axios.get(apiUrl, { params });
      setBooks(response.data.data.slice(0, limit)); // 항상 limit만큼 데이터 표시
      setTotalBooks(response.data.totalBooks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  const handleSearch = (responseData, keyword) => {
    setSearchKeyword(keyword); // 검색어 상태 업데이트
    setBooks(responseData.data.slice(0, limit)); // 검색 결과 중 상위 5개만 도서 목록 업데이트
    setTotalBooks(responseData.totalBooks); // 총 도서 수 업데이트
    setCurrentPage(1); // 검색 시 페이지를 1로 초기화
    setSelectedCategory(''); // 검색 시 선택된 카테고리 초기화
    console.log('Search triggered with keyword:', keyword);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category); // 선택한 카테고리 ID로 상태 업데이트
    setCurrentPage(1); // 필터 변경 시 페이지를 1로 초기화
  };

  const totalPages = Math.ceil(totalBooks / limit); // 총 페이지 수 계산

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      console.log(
        'Page changed to:',
        page,
        'Current Search Keyword:',
        searchKeyword
      ); // 페이지 변경 확인용 콘솔로그
    }
  };

  const handleBookSelect = async (book) => {
    try {
      const response = await axios.get(
        GET_CHECK_THREAD_EXISTENCE_API_URL(book.book_id)
      );
      if (response.data.exists) {
        alert('이미 해당 책에 대한 스레드가 존재합니다.');
        return; // 스레드가 존재할 경우 선택하지 않음
      }
      setSelectedBook(book);
    } catch (error) {
      console.error('Error checking thread existence:', error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setErrorMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setThreadComment('');
    setErrorMessage('');
  };

  const handlePostThread = async () => {
    if (!threadComment.trim()) {
      setErrorMessage('첫 댓글을 입력하지 않으면 스레드를 생성할 수 없습니다.');
      return;
    }

    const requestData = {
      book_id: selectedBook.book_id,
      member_num: memberNum,
      thread_content: threadComment,
    };

    try {
      const response = await axios.post(
        POST_CREATE_THREAD_API_URL,
        requestData
      );
      setThreadComment('');
      setSelectedBook(null);
      closeModal();
      navigate('/thread_on');
    } catch (error) {
      console.error('Error creating thread:', error);
      setErrorMessage('스레드 생성 중 오류가 발생했습니다.');
    }
  };

  // 한 행에 표시할 아이템 수와 빈 카드 수 계산
  const itemsPerRow = 5;
  const emptyCardCount = itemsPerRow - (books.length % itemsPerRow);

  return (
    <div className="thread-container">
      <div className="new_thread_book_search">
        <div className="flex">
          <CategoryFilter onCategoryChange={handleCategoryChange} />
          <SearchBar
            apiUrl={GET_SEARCH_BOOKS_API_URL}
            onSearch={handleSearch}
          />
        </div>
        <Link to="/thread_on">
          <button className="post-thread-button">To Thread List</button>
        </Link>
      </div>

      <div className="selected-book-container">
        <div>
          {selectedBook ? (
            <div className="selected-box">
              <img
                className="selected-book"
                src={selectedBook.book_cover}
                alt="책 표지"
                onClick={() => setSelectedBook(null)}
              />
              <button className="post-thread-button" onClick={openModal}>
                Post Thread
              </button>
            </div>
          ) : (
            <div className="placeholder-image" />
          )}
        </div>

        <div className="selected-book-details ml-7">
          {selectedBook ? (
            <>
              <h2>{selectedBook.book_title}</h2>
              <div className="book-star thread-star">
                <img
                  src={small_star}
                  alt="아이콘"
                  className="small_star w-5 h-5"
                />
                <p className="average_star">{selectedBook.average_rating}</p>
                <p className="comment_total_people">
                  ({selectedBook.review_count})
                </p>
              </div>
              <div className="book-info-row">
                <div className="book-info-left">
                  <p>저자</p>
                  <p>출판사</p>
                  <p>출판일</p>
                </div>
                <div className="book-info-right">
                  <p>{selectedBook.book_author}</p>
                  <p>{selectedBook.book_publisher}</p>
                  <p>
                    {new Date(selectedBook.publish_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="select-waiting">도서를 선택해주세요.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <h2>Start a New Thread</h2>
            <p>스레드를 열어보세요</p>
            <p>새로운 스레드를 시작하려면 첫 번째 댓글을 남겨주세요.</p>
            <textarea
              className="thread-comment-input"
              placeholder="댓글을 입력하세요..."
              value={threadComment}
              onChange={(e) => setThreadComment(e.target.value)}
              maxLength={300}
            />
            <p className="comment-count">{threadComment.length}/300</p>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="post-thread-button" onClick={handlePostThread}>
              Post Thread
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="booklist_wrapper thread-book-list">
          <div className="booklist_content">
            {books.map((book) => (
              <div
                key={book.book_id}
                onClick={() => handleBookSelect(book)}
                style={{ cursor: 'pointer' }}
              >
                <BookCard
                  thumbnail={book.book_cover}
                  title={book.book_title}
                  author={book.book_author}
                  publisher={book.book_publisher}
                  rating={book.average_rating}
                  reviewCount={book.review_count}
                  bookId={book.book_id}
                  disableLink={true}
                />
              </div>
            ))}
            {/* 빈 카드 추가 */}
            {/* {Array.from({ length: emptyCardCount }).map((_, index) => (
              <div
                key={`empty-${index}`}
                style={{
                  width: '280px',
                  aspectRatio: '3 / 4',
                  visibility: 'hidden',
                }}
              />
            ))} */}
          </div>
          <div className="pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalBooks / limit)}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Threadon_post;
