import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // useSelector 추가
import { createCommunityPostData } from '../../redux/features/auth/apiSlice';
import { initializeAuth } from '../../redux/features/auth/authSlice';
import publicIcon from '../../assets/images/public-icon.png';
import privateIcon from '../../assets/images/only-me-icon.png';
import './NewForum.css';

const NewForum = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const member_num = useSelector((state) => state.auth.user?.memberNum);
  console.log('Redux member_num:', member_num);

  useEffect(() => {
    const initializeAuthState = async () => {
      if (!authInitialized) {
        await dispatch(initializeAuth());
        setAuthInitialized(true);
      }
    };

    initializeAuthState();
  }, [dispatch, authInitialized]);

  useEffect(() => {
    console.log('Auth Initialized:', authInitialized);
    console.log('Redux member_num:', member_num);
  }, [authInitialized, member_num]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!member_num) {
      alert('사용자 정보가 올바르지 않습니다. 다시 로그인해 주세요.');
      return;
    }

    console.log('Submitting post data:', {
      member_num,
      post_title: title,
      post_content: content,
      post_status: 'active',
      visibility,
    });

    try {
      const result = await dispatch(
        createCommunityPostData({
          member_num,
          post_title: title,
          post_content: content,
          post_status: 'active',
          visibility,
        })
      );

      if (!result.error) {
        navigate('/community');
      } else {
        console.error('게시글 작성 실패:', result.error.message);
        alert(`게시글 작성에 실패했습니다: ${result.error.message}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleDelete = () => {
    navigate('/community');
  };

  return (
    <>
      <div className="new-forum-container">
        <h2>COMMUNITY</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group title-group">
            <span className="input-label">제목</span>
            <div className="title-input-wrapper">
              <input
                type="text"
                id="title"
                placeholder="제목을 입력해주세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div
              className={`toggle-button ${visibility ? 'public' : 'private'}`}
              onClick={() => setVisibility(!visibility)}
            >
              <img src={privateIcon} alt="Private Icon" />
              <div className="toggle-circle"></div>
              <img src={publicIcon} alt="Public Icon" />
            </div>
          </div>
          <div className="form-group content-group">
            <div className="content-label">내용</div>
            <textarea
              id="content"
              placeholder="내용을 입력해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="button-container">
            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button type="submit" className="submit-button">
              Post Forum
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewForum;
