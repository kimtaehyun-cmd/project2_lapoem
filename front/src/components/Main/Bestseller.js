// Bestseller.js
import React, { useEffect, useState } from 'react';
import BookCard from '../Bookcard';
import './booksection.css'; // 공통 CSS 파일
import { GET_BEST_BOOK_API_URL } from '../../util/apiUrl';

function Bestseller() {
  const [bestBooks, setBestBooks] = useState([]);

  useEffect(() => {
    const fetchBestBooks = async () => {
      try {
        const response = await fetch(GET_BEST_BOOK_API_URL);
        if (!response.ok) throw new Error('Failed to fetch best books');

        const data = await response.json();
        setBestBooks(data);
      } catch (error) {
        console.error('Error fetching best books:', error);
      }
    };

    fetchBestBooks();
  }, []);

  return (
    <section className="book-section best">
      <div className="section-title">
        <h2>MONTHLY BEST SELLERS</h2>
        <p>월간 베스트 셀러! 화제가 된 작품들을 만나보세요 📚</p>
      </div>
      <div className="book-list">
        {bestBooks.map((book, idx) => (
          <BookCard
            key={idx}
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
    </section>
  );
}

export default Bestseller;
