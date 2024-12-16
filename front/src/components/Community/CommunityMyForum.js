import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCommunityPostsData,
  fetchUserStats,
  fetchHotTopics,
  fetchTopUsers,
} from '../../redux/features/auth/apiSlice';
import './Community.css';
import chartIcon from '../../assets/images/chart.png';
import rank1Icon from '../../assets/images/rank1-icon.png';
import rank2Icon from '../../assets/images/rank2-icon.png';
import rank3Icon from '../../assets/images/rank3-icon.png';
import documentIcon from '../../assets/images/document.png';
import publicIcon from '../../assets/images/public-icon.png';
import meIcon from '../../assets/images/only-me-icon.png';
import Pagination from '../PageNation';

const CommunityMyForum = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
  });
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [hotTopics, setHotTopics] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;

  const {
    fetchCommunityPosts: communityPosts,
    isLoading,
    isError,
    errorMessage,
  } = useSelector((state) => state.api);

  const {
    user: currentUser,
    isLoggedIn,
    authInitialized,
  } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('Current user state:', currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (authInitialized && currentUser?.memberNum) {
      // 사용자 통계 데이터 가져오기
      const memberNum = currentUser.memberNum;
      dispatch(fetchUserStats(memberNum)).then((result) => {
        if (result.error) {
          console.error('Error fetching user stats:', result.error);
        } else if (result.payload) {
          setUserStats({
            totalPosts: result.payload.total_posts,
            totalComments: result.payload.total_comments,
          });
        }
      });
    }
  }, [authInitialized, currentUser, dispatch]);

  useEffect(() => {
    dispatch(fetchHotTopics()).then((result) => {
      if (result.payload) {
        setHotTopics(result.payload);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTopUsers()).then((result) => {
      if (result.payload) {
        setTopUsers(result.payload);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    setIsLoadingPosts(true);
    if (authInitialized && currentUser?.memberNum) {
      const memberNum = currentUser.memberNum;

      // 로그인한 사용자의 Only me 게시물과 Public 게시물 모두 가져오기
      Promise.all([
        dispatch(
          fetchCommunityPostsData({
            viewType: 'Only me', // Only me 게시물 요청
            member_num: memberNum, // 로그인한 사용자의 Only me 게시물만 필터링
            source: 'my_forum', // 요청 출처를 지정하여 필터링 처리
          })
        ),
        dispatch(
          fetchCommunityPostsData({
            viewType: 'Public', // Public 게시물 요청
            member_num: memberNum, // 로그인한 사용자의 Public 게시물만 필터링
            source: 'my_forum', // 요청 출처를 지정하여 필터링 처리
          })
        ),
      ]).then(([onlyMePostsResult, publicPostsResult]) => {
        if (onlyMePostsResult.payload && publicPostsResult.payload) {
          // 두 결과를 결합하여 로그인한 사용자의 모든 게시물을 가져옴
          const combinedPosts = [
            ...onlyMePostsResult.payload,
            ...publicPostsResult.payload,
          ];
          // 로그인한 사용자의 게시물만 필터링
          const filtered = combinedPosts.filter(
            (post) => Number(post.member_num) === Number(memberNum)
          );
          setFilteredPosts(filtered);
        }
        setIsLoadingPosts(false);
      });
    } else {
      setIsLoadingPosts(false);
    }
  }, [authInitialized, currentUser, dispatch]);

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  const handleNewForumClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault(); // 기본 링크 동작 막기
      const confirmLogin = window.confirm(
        '회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?'
      );
      if (confirmLogin) {
        navigate('/login'); // 확인을 누르면 로그인 페이지로 이동
      }
    }
  };

  const handleMyForumsClick = () => {
    navigate('/community/my_forum');
  };

  const truncateContent = (content, maxLines = 3) => {
    const lines = content.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n');
    }
    return content;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="community-container">
      <div className="content-wrapper">
        <div className="main-content">
          <div className="header">
            <h1 className="community-title">My Forums</h1>
          </div>

          <div className="posts-container">
            {isLoadingPosts ? (
              <div>Loading posts...</div>
            ) : isError ? (
              <p>{errorMessage}</p>
            ) : filteredPosts.length === 0 ? (
              <div className="no-posts-message-container">
                <p className="no-posts-message">
                  아직 작성된 게시글이 없습니다. 첫 게시글을 작성해보세요!
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.posts_id}
                  className="post-item regular-post"
                  onClick={() => handlePostClick(post.posts_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="post-middle">
                    <div className="post-contents">
                      <h3>{post.post_title}</h3>
                      <p>
                        {truncateContent(post.post_content, 3)
                          .split('\n')
                          .map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                        {post.post_content.split('\n').length > 3 && (
                          <span
                            className="see-more"
                            onClick={(e) => {
                              e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
                              handlePostClick(post.posts_id);
                            }}
                          >
                            ···자세히보기
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="post-footer">
                      <div className="post-info-left">
                        <span className="post-author">
                          작성자: {post.member_nickname}
                        </span>
                        <span className="post-date">
                          작성날짜:{' '}
                          {new Date(post.post_created_at).toLocaleString()}
                        </span>
                        <img
                          src={post.visibility ? publicIcon : meIcon}
                          alt={post.visibility ? 'Public' : 'Only me'}
                          className="visibility-icon"
                          style={{ marginLeft: '10px' }} // 여유 공간 추가
                        />
                      </div>
                      <div className="comment-count-wrapper">
                        <img
                          src={require('../../assets/images/comment.png')}
                          alt="Comment Icon"
                          className="comment-icon"
                        />
                        <span className="comment-count">
                          {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pagination-container">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredPosts.length / postsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="my-forums-section">
            <div className="my-forums-header">
              {isLoggedIn
                ? currentUser?.nickname || currentUser?.name || 'User'
                : '로그아웃 상태'}{' '}
            </div>
            <div className="my-forums-stats">
              <div className="my-forums-stat" onClick={handleMyForumsClick}>
                <img src={documentIcon} alt="My Forums Icon" />
                <div className="my-forums-stat-title">My Forums</div>
                <div className="my-forums-stat-value">
                  {userStats.totalPosts}
                </div>
              </div>
              <div className="my-comment-stat">
                <img src={chartIcon} alt="Total Views Icon" />
                <div className="my-comment-stat-title">My Comment</div>
                <div className="my-comment-stat-value">
                  {userStats.totalComments}
                </div>
              </div>
            </div>
          </div>
          <div className="sidebar-section">
            <h2>Weekly Hot Forums</h2>
            <div className="hot-topics">
              {hotTopics.slice(0, 3).map((topic, index) => (
                <div
                  key={topic.posts_id}
                  className="topic-item"
                  onClick={() => navigate(`/community/${topic.posts_id}`)}
                >
                  <img
                    src={
                      index === 0
                        ? rank1Icon
                        : index === 1
                        ? rank2Icon
                        : rank3Icon
                    }
                    alt={`Rank ${index + 1} Icon`}
                    className="topic-icon"
                  />
                  <span>{topic.post_title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <h2>Today's People</h2>
            <div className="top-users">
              {topUsers.map((user, index) => (
                <div key={index} className="user-item">
                  <img
                    src={
                      index === 0
                        ? rank1Icon
                        : index === 1
                        ? rank2Icon
                        : rank3Icon
                    }
                    alt={`Rank ${index + 1} Icon`}
                    className="user-icon"
                  />
                  <span>{user.member_nickname}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Forums Button */}
          <div className="sidebar-section">
            <Link to="/new_forum" onClick={handleNewForumClick}>
              <button className="new-forum-button">New Forum</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMyForum;
