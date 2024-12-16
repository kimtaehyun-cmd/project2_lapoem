import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GET_BOOK_LIST_API_URL,
  GET_BOOK_BY_CATEGORY_API_URL,
  GET_SEARCH_BOOKS_API_URL,
} from '../../util/apiUrl';
import Pagination from '../PageNation';
import SearchBar from '../Common/SearchBar';
import CategoryFilter from '../Common/CategoryFilter';
import TopOfBookList from './TopOfBookList';
import BookCard from '../Bookcard';

import './Booklist.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // 검색어 상태 추가

  useEffect(() => {
    if (searchKeyword) {
      fetchSearchResults(currentPage, searchKeyword); // 검색어가 있을 때는 검색 API 호출
    } else {
      fetchBooks(currentPage, selectedCategory); // 그렇지 않을 경우 일반 목록 API 호출
    }
  }, [currentPage, selectedCategory, searchKeyword]);

  const fetchBooks = async (page, genre_tag_id) => {
    setLoading(true);
    try {
      const apiUrl = genre_tag_id
        ? GET_BOOK_BY_CATEGORY_API_URL
        : GET_BOOK_LIST_API_URL;
      const response = await axios.get(apiUrl, {
        params: { page, limit, genre_tag_id },
      });
      setBooks(response.data.data);
      setTotalBooks(response.data.totalBooks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
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
  };

  const fetchSearchResults = async (page, keyword) => {
    setLoading(true);
    try {
      const response = await axios.get(GET_SEARCH_BOOKS_API_URL, {
        params: { keyword, page, limit },
      });
      setBooks(response.data.data);
      setTotalBooks(response.data.totalBooks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchKeyword(''); // 카테고리 변경 시 검색어 초기화
  };

  const totalPages = Math.ceil(totalBooks / limit);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="booklist_container">
      <h1 className="booklist_pagetitle">BOOK LIST</h1>
      <div className="booklist_search">
        <CategoryFilter onCategoryChange={handleCategoryChange} />
        <SearchBar apiUrl={GET_SEARCH_BOOKS_API_URL} onSearch={handleSearch} />
      </div>
      <TopOfBookList />
      {loading ? (
        <p>Loading...</p>
      ) : books.length === 0 ? (
        <p className="no_book_message">검색 결과가 없습니다.</p>
      ) : (
        <div className="booklist_wrapper">
          <div className="booklist_content">
            {books.map((book) => (
              <BookCard
                key={book.book_id}
                bookId={book.book_id}
                thumbnail={book.book_cover}
                title={book.book_title}
                author={book.book_author}
                publisher={book.book_publisher}
                rating={book.average_rating}
                reviewCount={book.review_count}
              />
            ))}
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
