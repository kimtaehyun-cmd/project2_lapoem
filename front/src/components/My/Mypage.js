import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logoutUser, updateNickname, clearMessage } from '../../redux/features/auth/authSlice';
import birthIcon from '../../assets/images/birth_icon.png';
import { GET_MEMBER_INFO_API_URL, UPDATE_MEMBER_INFO_API_URL, DELETE_MEMBER_API_URL } from '../../util/apiUrl';
import '../My/Mypage.css';

const Mypage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const member_num = useSelector((state) => state.auth.user?.memberNum);
  const [memberData, setMemberData] = useState(null);
  const [memberId, setMemberId] = useState('');
  const [nickname, setNickname] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const message = useSelector((state) => state.auth.message);

  const alertShownRef = useRef(false);

  useEffect(() => {
    if (member_num) {
      const fetchMemberInfo = async () => {
        try {
          const response = await axios.get(GET_MEMBER_INFO_API_URL(member_num), { withCredentials: true });
          const data = response.data;
          setMemberId(data.member_id);
          setMemberData(data);
          setNickname(data.member_nickname || '');
          setContact(data.member_phone || '');
          setEmail(data.member_email || '');
          setMarketingConsent(data.marketing_consent || false);
          setGender(data.member_gender || '');
          setBirthdate(data.member_birth_date || '');
        } catch (error) {
          setError(error.response?.data?.message || 'Failed to fetch member info');
        }
      };
      fetchMemberInfo();
    }
  }, [member_num]);

  const handleInputChange = (e, setter, validateFunc) => {
    const value = e.target.value;
    setter(value);
    setIsEdited(true);

    // 유효성 검사 함수가 있는 경우, 오류 메시지를 업데이트합니다.
    const validationError = validateFunc ? validateFunc(value) : null;
    setError(validationError);
  };

  const handleMarketingConsentChange = (e) => {
    setMarketingConsent(e.target.checked);
    setIsEdited(true);
  };

  const validateNickname = (nickname) => {
    if (nickname.length < 1 || nickname.length > 20) {
      return '닉네임은 1자리 이상 20자리 이하만 설정 가능합니다!';
    }
    return null;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return '중복된 이메일이 있거나 이메일 형식이 맞지 않습니다!';
    }
    return null;
  };

  const validateContact = (contact) => {
    const contactRegex = /^010\d{8}$/;
    if (!contactRegex.test(contact)) {
      return '전화번호는 반드시 010으로 시작하는 11자리 이어야 합니다!';
    }
    return null;
  };

  const handleSave = async () => {
    const nicknameError = validateNickname(nickname);
    const emailError = validateEmail(email);
    const contactError = validateContact(contact);

    if (nicknameError || emailError || contactError) {
      setError(nicknameError || emailError || contactError);
      return;
    }

    const isConfirmed = window.confirm('회원 정보를 수정하시겠습니까?');
    if (isConfirmed) {
      try {
        const updatedData = {
          member_email: email,
          member_phone: contact,
          member_nickname: nickname,
          marketing_consent: marketingConsent,
        };

        const response = await axios.patch(UPDATE_MEMBER_INFO_API_URL(member_num), updatedData, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setIsSaved(true);
          setIsEdited(false);
          setMemberData(response.data);
          dispatch(updateNickname(nickname));
          setTimeout(() => setIsSaved(false), 3000);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to update member info');
      }
    }
  };

  const handleCancel = () => {
    setNickname(memberData?.member_nickname || '');
    setContact(memberData?.member_phone || '');
    setEmail(memberData?.member_email || '');
    setMarketingConsent(memberData?.marketing_consent || false);
    setIsEdited(false);
    window.location.reload();
  };

  useEffect(() => {
    if (message && !alertShownRef.current) {
      alertShownRef.current = true;
      alert(message);
      dispatch(clearMessage()); // 메시지를 초기화하여 다른 곳에서 중복으로 표시되지 않도록 함
      setTimeout(() => {
        navigate('/');
      }, 0);
    }
  }, [message, dispatch, navigate]);

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm('정말 회원 탈퇴를 하시겠습니까? 계정 삭제 후엔 복구가 불가합니다.');
    if (isConfirmed) {
      try {
        const response = await axios.delete(DELETE_MEMBER_API_URL(member_num), {
          withCredentials: true,
        });

        if (response.status === 200) {
          await dispatch(logoutUser({ isDelete: true }));
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete the account');
      }
    }
  };

  return (
    <div className="mypage_container">
      <div className="my_page_top">
        <div className="my_page_title">MY PAGE</div>
        <div className="my_page_desc">가입 시 작성한 회원 정보를 수정할 수 있습니다.</div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {isSaved && <div className="success-message">회원 정보가 성공적으로 수정되었습니다.</div>}
      <div className="my_page_content">
        <div className="my_page_content_title">회원 정보 수정</div>
        <div className="my_page_content_info">
          <div>
            <label>아이디</label>
            <input type="text" value={memberId || ''} disabled />
          </div>
          <div>
            <label>닉네임</label>
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => handleInputChange(e, setNickname)}
            />
          </div>
          <div>
            <label>연락처</label>
            <input
              type="text"
              placeholder="연락처를 입력하세요"
              value={contact}
              onChange={(e) => handleInputChange(e, setContact)}
            />
          </div>
          <div className="my_email">
            <label>이메일</label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => handleInputChange(e, setEmail)}
            />
          </div>
          <div className="marketing-container">
            <input
              type="checkbox"
              id="marketingConsent"
              checked={marketingConsent}
              onChange={handleMarketingConsentChange}
            />
            <label htmlFor="marketingConsent">마케팅 수신 동의</label>
          </div>
          <div className="my_privacy">
            <div className="my_birth">
              <div className="birthdate-display">
                <img src={birthIcon} alt="birthday icon" />
                <span>{birthdate}</span>
              </div>
            </div>
            <div className="my_gender">
              <div className="gender_toggle">
                <button className={gender === '남' ? 'selected' : ''} disabled>
                  남
                </button>
                <button className={gender === '여' ? 'selected' : ''} disabled>
                  여
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="my_page_button">
        <button id="deleteBtn" onClick={handleDeleteAccount}>
          DELETE MY ACCOUNT
        </button>
        <div className="button-group-right">
          <button id="saveBtn" className={isEdited ? 'active' : ''} disabled={!isEdited} onClick={handleSave}>
            SAVE
          </button>
          <button id="cancelBtn" className={isEdited ? 'active' : ''} disabled={!isEdited} onClick={handleCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mypage;
