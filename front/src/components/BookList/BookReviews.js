import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  GET_BOOK_REVIEWS_API_URL,
  DELETE_REVIEW_API_URL,
} from '../../util/apiUrl';
// 컴퍼넌트
import BookCreateReview from './BookCreateReview';
import HeartRating from './HeartRating';
// 리소스
import deleteIcon from '../../assets/images/delete.png';
import './BookReview.css';

const BookReviews = () => {
  const { bookId, reviewId } = useParams();
  console.log('Fetched bookId:', bookId);

  const dispatch = useDispatch();
  const member_num = useSelector((state) => state.auth.user?.memberNum);
  const [reviews, setReviews] = useState([]); // 리뷰 상태 초기화
  const [loading, setLoading] = useState(true); // 로딩 상태 초기화
  const [error, setError] = useState(null); // 에러 상태 초기화

  useEffect(() => {
    fetchReviews(); // bookId가 변경될 때마다 리뷰를 가져오는 함수 호출
  }, [bookId, reviewId]);

  const fetchReviews = async () => {
    if (!bookId) {
      // bookId가 유효한지 확인
      setError('유효하지 않은 책 ID입니다.');
      setLoading(false);
      return;
    }

    setLoading(true); // 데이터 요청 시작 시 로딩 상태 설정
    setError(null); // 이전 에러 상태 초기화

    try {
      const response = await axios.get(GET_BOOK_REVIEWS_API_URL(bookId), {
        withCredentials: true,
      }); // API 호출
      console.log('Fetched reviews:', response.data);
      setReviews(response.data); // 가져온 리뷰 데이터를 상태에 저장
    } catch (error) {
      console.error('Error fetching book reviews:', error);
      setError('리뷰를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]); // Add the new review at the top
  };

  const handleDeleteReview = async (reviewId) => {
    const userConfirmed = window.confirm(
      '정말로 삭제하시겠습니까? 삭제 후에는 복구가 불가능합니다.'
    );
    if (!userConfirmed) return; // If the user clicks "Cancel", stop the deletion

    try {
      const deleteResponse = await axios.delete(
        DELETE_REVIEW_API_URL(bookId, reviewId),
        { withCredentials: true }
      );
      window.location.reload(); // 리뷰가 삭제된 후 페이지를 새로고침
      if (deleteResponse.status === 200) {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.review_num !== reviewId)
        );
        alert('리뷰가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('리뷰 삭제 중 오류 발생:', error.response || error);
      if (error.response?.status === 401) {
        alert('인증이 필요합니다. 다시 로그인해주세요.');
      }
      setError('리뷰 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <p>로딩 중...</p>; // 로딩 중일 때 메시지 출력
  if (error) return <p>{error}</p>; // 에러가 있을 경우 에러 메시지 출력

  return (
    <div>
      <div className="book-review-list">
        <h2 className="book-review-title">BLOVER REVIEWS</h2>
        <div className="book-create-review"></div>
        {reviews.length > 0 ? ( // 리뷰가 있는지 체크
          <ul className="review-list">
            {reviews.map((review, index) => (
              <li key={review.review_num || index} className="review-item">
                <div className="review-header">
                  <h3 className="review-nickname">{review.member_nickname}</h3>
                  <span className="review-date">
                    {review.review_created_at}
                  </span>
                  <HeartRating rating={review.rating} />
                </div>
                <div className="review-right">
                  {member_num === review.member_num && (
                    <img
                      className="delete-icon"
                      src={deleteIcon}
                      alt="Delete Comment"
                      onClick={() => handleDeleteReview(review.review_num)}
                    />
                  )}
                </div>

                <p className="review-content">{review.review_content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="book-review-none">
            작성된 리뷰가 없습니다, 첫번째 BLOVER가 되세요!
          </p>
        )}
        <BookCreateReview handleAddReview={handleAddReview} />
      </div>
    </div>
  );
};
export default BookReviews;
