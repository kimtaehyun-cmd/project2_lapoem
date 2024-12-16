import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CREATE_BOOK_REVIEW_API_URL } from '../../util/apiUrl';
// 별점 처리 이미지
import heartRating from '../../assets/images/heart-rating.png';
import heartRatingEmpty from '../../assets/images/heart-rating-empty.png';

import './Booklist.css';

const BookCreateReview = ({ handleAddReview }) => {
  const { bookId } = useParams();
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [charCount, setCharCount] = useState(0); // 글자 수 상태 추가
  const maxCharLimit = 300; // 최대 글자 수 제한 설정
  const [hasExistingReview, setHasExistingReview] = useState(false); // 새로운 상태로 기존 리뷰 존재 여부 확인
  const navigate = useNavigate();
  const reviewBoxRef = useRef(null);

  const member_num = useSelector((state) => state.auth.user?.memberNum);

  useEffect(() => {
    //이미 존재한 리뷰 체크
    const checkExistingReview = async () => {
      if (!member_num) return;
      try {
        const response = await axios.get(CREATE_BOOK_REVIEW_API_URL(bookId), {
          withCredentials: true,
        });

        // "삭제됨"이 아닌 리뷰가 있는지 확인
        const existingReview = response.data.find(
          (review) =>
            review.member_num === member_num && review.status !== 'deleted'
        );

        setHasExistingReview(!!existingReview);
      } catch (error) {
        console.error('Error checking for existing review:', error);
      }
    };
    checkExistingReview();
  }, [bookId, member_num]);

  const handleReviewSubmit = async () => {
    if (!member_num) {
      alert('회원 로그인이 필요합니다.'); // 로그인 확인
      console.log('User not logged in'); // 로그인 확인 콘솔 출력
      return;
    }

    if (hasExistingReview) {
      alert('이미 작성한 리뷰가 있습니다. 리뷰는 한 번만 작성할 수 있습니다.');
      return;
    }

    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    if (!reviewContent.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    console.log('Logged in user:', member_num);

    try {
      const response = await axios.post(
        CREATE_BOOK_REVIEW_API_URL(bookId),
        {
          review_content: reviewContent,
          rating,
          member_num,
        },
        { withCredentials: true }
      );

      console.log('Review successfully posted:', response.data);

      // 날짜를 'DD.MM.YY (HH24:MI)' 형식으로 포맷팅하는 함수
      const formatDate = (date) => {
        const options = {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        };
        const formattedDate = date.toLocaleString('en-GB', options); // 'en-GB'를 사용하여 24시간 형식을 지원

        // 문자열을 분리하여 형식에 맞게 조합
        const [day, month, year, hour, minute] =
          formattedDate.split(/[\/,\s:]+/);
        return `${day}.${month}.${year} (${hour}:${minute})`;
      };

      // 서버에서 반환되는 데이터 구조 확인
      const newReview = {
        review_num: response.data.review_num, // 서버에서 제공되는 review ID
        review_content: reviewContent,
        rating: rating,
        review_created_at: formatDate(new Date()),
        member_nickname: response.data.member_nickname,
        member_num: member_num,
      };

      setReviewContent(''); // 리뷰 내용 초기화
      setRating(0); // 평점 초기화
      setCharCount(0); // 글자 수 초기화

      if (reviewBoxRef.current) {
        reviewBoxRef.current.textContent = ''; //편집한 내용 초기화
      }
      handleAddReview(newReview);
      window.location.reload(); // 페이지를 새로 고침
    } catch (error) {
      console.error('Error posting review:', error); // 에러 발생 시 콘솔 출력
    }
  };

  // 리뷰 입력창 클릭 이벤트 핸들러 추가
  const handleReviewBoxClick = () => {
    if (!member_num) {
      alert('회원 로그인이 필요합니다.');
      navigate('/login');
    }
  };

  // 글자 수 업데이트 및 제한
  const handleInputChange = (e) => {
    const content = e.currentTarget.textContent;
    if (content.length <= maxCharLimit) {
      setReviewContent(content);
      setCharCount(content.length); // 글자 수 업데이트
    } else {
      e.currentTarget.textContent = reviewContent; // 최대 글자 수 초과 시 내용 되돌리기
    }
  };

  // 붙여넣기 시 최대 글자 수 제한
  const handlePaste = (e) => {
    e.preventDefault(); // 기본 붙여넣기 동작 방지
    const clipboardText = e.clipboardData.getData('text'); // 클립보드에서 텍스트 가져오기
    const allowedText = clipboardText.slice(0, maxCharLimit - charCount); // 남은 글자 수만큼만 가져오기
    const newText = reviewContent + allowedText; // 기존 텍스트와 합치기

    if (newText.length <= maxCharLimit) {
      setReviewContent(newText); // 300자 이하일 경우 전체 텍스트를 설정
      setCharCount(newText.length); // 글자 수 업데이트
      if (reviewBoxRef.current) {
        reviewBoxRef.current.textContent = newText; // 입력창에 텍스트 반영
      }
    }
  };

  // 별점 처리
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const score = i * 2; // 2, 4, 6, 8, 10 점

      // 로그인 않을 경우 알럭 처리
      const handleClick = () => {
        if (!member_num) {
          alert('회원 로그인이 필요합니다.'); // Show alert for unauthenticated users
          navigate('/login'); // Redirect to login page
        } else {
          setRating(i * 2); // Set the rating if user is logged in
        }
      };

      // 채워진 하트 이미지 결정
      let starImage;
      if (score <= (hoverRating || rating)) {
        // 색이 채워진 경우
        starImage = heartRating; // 전체 하트
      } else {
        starImage = heartRatingEmpty; // 빈 하트
      }

      stars.push(
        <img
          key={i}
          src={starImage} // 채워진 하트 또는 빈 하트 전환
          alt={`star-${i}`}
          className="star"
          onClick={handleClick}
          onMouseEnter={() => setHoverRating(score)} // 마우스 올리면 전체 하트로 색 변화
          onMouseLeave={() => setHoverRating(0)} // 마우스가 벗어나면 기본 상태로
        />
      );
    }
    return stars;
  };

  return (
    <div className="book-review-create">
      <div className="book-rating">{renderStars()}</div>

      <div
        className="book-review-box"
        ref={reviewBoxRef}
        contentEditable
        onClick={handleReviewBoxClick} // 로그인 확인 기능 추가
        onInput={handleInputChange} // 글자 수 제한 함수 연결
        onPaste={handlePaste} // 붙여넣기 제한 이벤트 추가
        suppressContentEditableWarning={true}
      ></div>
      <div className="review-tip">
        <span>
          * 비고: 욕설 및 인신공격성 글은 리뷰 페이지에서 노출 제외처리됩니다.
        </span>
        <span>
          {charCount}/{maxCharLimit}자
        </span>{' '}
        {/* 글자 수 표시 */}
      </div>
      <div className="sned-button-container">
        <button onClick={handleReviewSubmit}>Send</button>
        {/* 새로 제출된 리뷰를 바로 화면에 표시 */}
      </div>
    </div>
  );
};

export default BookCreateReview;
