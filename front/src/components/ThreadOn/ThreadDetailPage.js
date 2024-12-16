import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Comment from './Comment';
import {
  GET_THREADS_DETAIL_API_URL,
  GET_THREADS_COMMENTS_API_URL,
  POST_THREAD_COMMENT_API_URL,
} from '../../util/apiUrl';
import './ThreadDetailPage.css';
import back from '../../assets/images/back.png';
import viewmore from '../../assets/images/viewmore.png';
import totalcomment from '../../assets/images/comment 2.png';
import totalpeople from '../../assets/images/totalpeople.png';
import rightarrow from '../../assets/images/rightarrow.png';

const ThreadDetailPage = () => {
  const { thread_num } = useParams();
  const [threadDetail, setThreadDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [memberNum, setMemberNum] = useState(null);
  const [loadedCommentCount, setLoadedCommentCount] = useState(0); // 불러온 총 댓글 수 상태

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const COMMENTS_LIMIT = 5;

  const navigate = useNavigate();

  // 초기 로드 시 memberNum 설정
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setMemberNum(user?.memberNum);
  }, []);

  // 스레드 상세 정보를 가져오는 함수
  const fetchThreadDetail = async () => {
    try {
      const response = await fetch(GET_THREADS_DETAIL_API_URL(thread_num));
      const data = await response.json();
      setThreadDetail(data);
    } catch (error) {
      console.error('Error fetching thread detail:', error);
    }
  };

  // 스레드 상세 정보 가져오기
  useEffect(() => {
    if (thread_num) {
      fetchThreadDetail();
    }
  }, [thread_num]);

  // 댓글을 가져오는 함수
  const fetchComments = async (currentOffset = 0, additionalLimit = COMMENTS_LIMIT) => {
    try {
      const response = await fetch(
        `${GET_THREADS_COMMENTS_API_URL(thread_num)}?offset=${currentOffset}&limit=${additionalLimit}`
      );
      const data = await response.json();

      if (data.comments.length < additionalLimit) {
        setHasMoreComments(false);
      }

      return data.comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  // 초기 로드 시 5개의 부모 댓글을 불러옴
  useEffect(() => {
    if (thread_num) {
      setComments([]);
      setOffset(0);
      setHasMoreComments(true);
      fetchComments(0).then((initialComments) => {
        setComments(initialComments);
      });
    }
  }, [thread_num]);

  // 댓글 삭제 성공 시 호출되는 함수
  const handleDeleteSuccess = async (deletedCommentId) => {
    setComments((prevComments) => {
      const updatedComments = prevComments.filter((comment) => comment.thread_content_num !== deletedCommentId);

      // 삭제 후 댓글 개수가 0개가 되면 리스트 페이지로 이동
      if (updatedComments.length === 0) {
        navigate('/thread_on'); // 리스트 페이지 경로로 이동
      }

      return updatedComments;
    });

    // 삭제 후, 현재까지 불러온 댓글 수에 맞춰 다시 댓글을 불러오기
    const updatedLimit = comments.length; // 현재 화면에 보여지는 댓글 수에 맞춰 설정

    fetchComments(0, updatedLimit).then((updatedComments) => {
      setComments(updatedComments);

      // 불러온 댓글 수가 현재 로드된 수보다 적으면 더보기 버튼 비활성화
      if (updatedComments.length < updatedLimit) {
        setHasMoreComments(false);
      } else {
        setHasMoreComments(true);
      }

      // 최신 스레드 상세 정보를 다시 가져옴
      fetchThreadDetail();
    });
  };

  // 댓글 작성 핸들러
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    if (!memberNum) {
      if (window.confirm('회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const response = await fetch(POST_THREAD_COMMENT_API_URL(thread_num), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_num: memberNum,
          thread_content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        setOffset(0);
        setHasMoreComments(true);

        // 댓글 목록 초기화 후 새로 불러오기
        fetchComments(0).then((initialComments) => {
          setComments(initialComments);
        });

        // 최신 스레드 상세 정보를 다시 가져옴
        fetchThreadDetail();
      } else {
        const errorData = await response.json();
        console.error('Failed to post comment:', errorData.message);
        alert(errorData.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  // 더보기 버튼 클릭 핸들러
  const handleLoadMoreComments = () => {
    const newOffset = offset + COMMENTS_LIMIT;
    setOffset(newOffset);
    fetchComments(newOffset).then((moreComments) => {
      setComments((prevComments) => [...prevComments, ...moreComments]);
      setLoadedCommentCount(loadedCommentCount + moreComments.length); // 불러온 댓글 수 업데이트
    });
  };

  // 댓글 입력 클릭 시 로그인 확인
  const handleCommentClick = () => {
    if (!isLoggedIn) {
      if (window.confirm('회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
    }
  };

  // 대댓글 등록 성공 시 호출되는 함수
  const handleReplySubmitSuccess = () => {
    fetchThreadDetail(); // 스레드 상세 정보 업데이트
  };

  // 대댓글 삭제 성공 시 호출되는 함수
  const handleReplyDeleteSuccess = () => {
    fetchThreadDetail(); // 스레드 상세 정보 업데이트
  };

  // 뒤로가기 핸들러
  const handleBackClick = () => {
    navigate('/thread_on');
  };

  // 댓글 입력 클릭 시 로그인 확인
  const handleCommentInputClick = () => {
    if (!isLoggedIn) {
      if (window.confirm('회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login'); // 예를 누르면 로그인 페이지로 이동
      }
    }
  };

  return (
    <div className="thread-detail-container">
      <h1 className="thread-header">THREAD ON</h1>

      <div className="thread-detail-wrapper">
        <div className="thread-detail-header-container">
          {threadDetail && (
            <div className="thread-detail-header">
              <div className="thread-detail-left" onClick={handleBackClick}>
                <img src={back} alt="뒤로 가기" className="to-thread-list" />
              </div>
              <div className="thread-detail-center">
                <img src={threadDetail.book_cover} alt="Book Cover" className="thread-detail-book-img" />
                <div className="thread-detail-info">
                  <h1>{threadDetail.book_title}</h1>
                  <p>{threadDetail.thread_created_at}</p>
                </div>
              </div>
              <div className="thread-detail-right">
                <div className="thread-total-people">
                  <img src={totalpeople} alt="총 참여자수" />
                  <p>{threadDetail.participant_count}</p>
                </div>
                <div className="thread-total-comment">
                  <img src={totalcomment} alt="총 댓글 및 대댓글 수" />
                  <p>{threadDetail.total_comments}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="comments-section">
          {comments.map((comment) => (
            <Comment
              key={comment.thread_content_num}
              comment={comment}
              thread_num={thread_num}
              onDeleteSuccess={handleDeleteSuccess}
              onReplySubmitSuccess={handleReplySubmitSuccess} // 대댓글 등록 콜백
              onReplyDeleteSuccess={handleReplyDeleteSuccess} // 대댓글 삭제 콜백
            />
          ))}
        </div>

        {hasMoreComments && (
          <div className="view-more-comment">
            <button className="load-more-button" onClick={handleLoadMoreComments}>
              <img src={viewmore} alt="댓글 더보기" />
            </button>
          </div>
        )}

        <div className="thread-comment-input-wrapper">
          <div className="thread-new-comment">
            <textarea
              className="thread-comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력해주세요."
              maxLength="300"
              onClick={handleCommentInputClick}
            />
            <div className="thread-comment-footer">
              <span className="thread-char-count">{newComment.length}/300</span>
              <button
                className="submit-button"
                onClick={isLoggedIn ? handleCommentSubmit : handleCommentClick}
                disabled={!isLoggedIn || !newComment.trim()}
              >
                Send
              </button>
            </div>
          </div>

          <button className="back-to-list-button" onClick={handleBackClick}>
            To List
            <img src={rightarrow} alt="화살표" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;
