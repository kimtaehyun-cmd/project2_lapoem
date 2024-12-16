import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchHotTopics } from '../../redux/features/auth/apiSlice'; // 해당 경로에 맞게 import
import './HotForums.css';

function HotForums() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hotTopics = useSelector((state) => state.api.hotTopics);

  useEffect(() => {
    dispatch(fetchHotTopics(5)); // 상위 5개 게시글 요청
  }, [dispatch]);

  const handlePostClick = (postId) => {
    navigate(`/community/${postId}`);
  };

  return (
    <div className="hot-forums">
      <h2>WEEKEND HOT FORUMS</h2>
      <p className="hot-forums-description">
        금주 사람들에게 인기가 많았던 독서 포럼들을 확인해보세요 🔥
      </p>
      <div className="forum-list">
        {hotTopics && hotTopics.length > 0 ? (
          hotTopics.map((topic, index) => (
            <div className="forum-item" key={topic.posts_id}>
              <span className="forum-rank">{index + 1}</span>
              <span className="forum-title-container">
                <span
                  className="forum-title link"
                  onClick={() => handlePostClick(topic.posts_id)}
                >
                  {topic.post_title}
                  <span
                    className="forum-comments-count"
                    style={{ color: '#999999' }}
                  >
                    ({topic.comment_count})
                  </span>
                </span>
              </span>
              <span className="forum-author-center">
                {topic.member_nickname}
              </span>
              <span className="forum-date">
                {new Date(topic.post_created_at)
                  .toLocaleDateString()
                  .replace(/\.$/, '')}
              </span>
            </div>
          ))
        ) : (
          <p>게시글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default HotForums;
