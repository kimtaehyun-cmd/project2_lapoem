import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearMessage } from '../../redux/features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [login_data, set_login_data] = useState({
    member_id: '',
    member_password: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    // 로그인 페이지가 로드될 때 error 초기화
    dispatch(clearMessage());
  }, [dispatch]);

  const handle_change = (e) => {
    set_login_data({ ...login_data, [e.target.name]: e.target.value });
  };

  const handle_login = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    await dispatch(loginUser(login_data));
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/'); // 로그인 성공 시 홈 경로로 이동
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (error) {
      alert('로그인 정보를 확인해 주세요.');
    }
  }, [error]);

  return (
    <div className="login_container">
      <h2 className="login_title">Login</h2>
      <span>로그인 후 라보엠의 모든 서비스를 이용해보세요</span>
      <form onSubmit={handle_login}>
        <input type="text" name="member_id" placeholder="아이디" onChange={handle_change} className="login_input" />
        <input
          type="password"
          name="member_password"
          placeholder="비밀번호"
          onChange={handle_change}
          className="login_input"
        />
        <button type="submit" className="login_button">
          로그인
        </button>
      </form>
      {error && <p className="error_message">{error}</p>}
      <Link to="/terms" className="signup_button">
        회원가입
      </Link>
    </div>
  );
}

export default Login;
