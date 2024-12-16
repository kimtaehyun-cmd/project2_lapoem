import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { GET_BOOK_DETAIL_API_URL } from '../../util/apiUrl';
// 컴포넌트
import BookReviewChart from './BookReviewChart';
import BookReviews from './BookReviews';
import { useSelector } from 'react-redux';

import heartRating from '../../assets/images/heart-rating.png';
import chatbot from '../../assets/images/chat.png';
import thread from '../../assets/images/thread.png';
import './BookDetail.css';

const BookDetail = () => {
  const navigate = useNavigate();
  const { bookId } = useParams(); // useParams 훅으로 bookId 가져오기
  const [bookDetail, setBookDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redux에서 사용자 번호 가져오기
  const user = useSelector((state) => state.auth.user);
  const memberNum = user ? user.memberNum : null;

  useEffect(() => {
    fetchBookDetail();
  }, [bookId]);

  const fetchBookDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(GET_BOOK_DETAIL_API_URL(bookId)); // 책의 상세 정보 요청
      console.log('Data fetched successfully:', response.data);

      setBookDetail(response.data); // 상세 정보 상태로 설정
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to load book details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    if (memberNum) {
      navigate(`/chatstella/${bookId}?memberNum=${memberNum}`);
    } else {
      const shouldNavigateToLogin = window.confirm('회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?');
      if (shouldNavigateToLogin) {
        navigate('/login');
      }
    }
  };

  const handleThread = () => {
    navigate('/thread_on');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="book-detail-container">
      <div className="booklist-pagetitle">BOOK LIST</div>
      <div className="book-detail-wrapper">
        {bookDetail ? (
          <>
            <div className="book-detail-top">
              <div className="book-detail-left">
                <img
                  src={bookDetail.book_cover || 'default-placeholder-image-url'}
                  alt={bookDetail.book_title}
                  className="book-detail-thumbnail"
                />
              </div>
              <div className="book-detail-right">
                {/* <!-- 아이콘 버튼들을 담을 컨테이너 --> */}
                <div class="book-detail-icons">
                  <button class="chatbot" onClick={handleStartChat}>
                    <img src={chatbot} alt="채팅 시작" />
                  </button>
                  <button class="thread" onClick={handleThread}>
                    <img src={thread} alt="스레드 이동" />
                  </button>
                </div>
                <div className="book-detail-labels">
                  {bookDetail.is_book_best && <span className="label-best-seller">베스트 셀러</span>}
                  <span className="label-genre">{bookDetail.genre_tag_name}</span>
                </div>
                <h2 className="book-detail-title">{bookDetail.book_title}</h2>
                <p className="book-detail-rating">
                  <span className="rating-score">
                    <img src={heartRating} alt="아이콘" className="heart_rating w-[20px] h-[20px]" />
                    {bookDetail.average_rating}
                  </span>
                  <span className="review-count"> ({bookDetail.review_count})</span>
                </p>
                <div className="book-detail-info">
                  <p>
                    <strong>저자:</strong> {bookDetail.book_author}
                  </p>
                  <p>
                    <strong>출판사:</strong> {bookDetail.book_publisher}
                  </p>
                  <p>
                    <strong>출판일:</strong> {bookDetail.publish_date}
                  </p>
                  <p>
                    <strong>정가:</strong> {bookDetail.book_price}
                  </p>
                  <p>
                    <strong>ISBN:</strong> {bookDetail.isbn}
                  </p>
                </div>
              </div>
            </div>
            <div className="book-detail-desc">
              <div className="book-detal-desc-line"></div>
              <h3>DESCRIPTION</h3>
              <p>{bookDetail.book_description}</p>
            </div>
            <div className="book-review-area">
              <BookReviewChart />
              <BookReviews />
            </div>
          </>
        ) : (
          <p>No details available for this book.</p>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
