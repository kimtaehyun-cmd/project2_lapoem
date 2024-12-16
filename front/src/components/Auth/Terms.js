import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GET_TERMS_API_URL } from '../../util/apiUrl';
import './Terms.css';
import PageHeader from './PageHeader';

function Terms() {
  const [terms, setTerms] = useState([]);
  const [agreements, setAgreements] = useState({});
  const [allChecked, setAllChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(GET_TERMS_API_URL);
        setTerms(response.data);
      } catch (error) {
        console.error('약관을 불러오는 중 오류가 발생했습니다.', error);
      }
    };
    fetchTerms();
  }, []);

  // 모든 동의 체크박스 상태 변경
  const handleAllCheckboxChange = () => {
    const newAllChecked = !allChecked;
    setAllChecked(newAllChecked);

    // 모든 약관의 동의 상태를 newAllChecked로 설정
    const newAgreements = {};
    terms.forEach((term) => {
      newAgreements[term.terms_id] = newAllChecked;
    });
    setAgreements(newAgreements);
  };

  // 개별 동의 체크박스 상태 변경
  const handleCheckboxChange = (termsId) => {
    const newAgreements = {
      ...agreements,
      [termsId]: !agreements[termsId],
    };

    setAgreements(newAgreements);

    // 모든 약관에 동의했는지 확인하여 `allChecked` 상태를 업데이트
    const allCheckedStatus = terms.every((term) => newAgreements[term.terms_id]);
    setAllChecked(allCheckedStatus);
  };

  const handleAgree = () => {
    const agreedTerms = Object.keys(agreements).filter((termsId) => agreements[termsId]);

    if (agreedTerms.length !== terms.length) {
      alert('라보엠 서비스를 이용하시려면 약관에 동의하셔야 합니다.');
      return;
    }

    navigate('/join', {
      state: { agreedTerms: agreedTerms.map((termsId) => ({ terms_id: parseInt(termsId), agreement_status: true })) },
    });
  };

  return (
    <div className="term_container">
      <PageHeader
        title="Terms & Policy"
        description="이용약관 및 개인정보 수집 및 이용 동의"
        step_title="약관 동의"
        steps={['약관 동의', '회원정보 입력', '가입 완료']}
        is_required={true}
        active_step={0} // 현재 페이지에 해당하는 단계 인덱스
      />

      <div className="term_all_agree">
        <input type="checkbox" id="all_agree" checked={allChecked} onChange={handleAllCheckboxChange} />
        <label htmlFor="all_agree">라보엠 이용약관과 개인정보 수집 및 이용에 모두 동의합니다.</label>
      </div>

      <div className="term_content">
        {terms.map((term) => (
          <div key={term.terms_id} className="term_section">
            <div className="term_agreement">
              <input
                type="checkbox"
                id={`agree-${term.terms_id}`}
                checked={agreements[term.terms_id] || false}
                onChange={() => handleCheckboxChange(term.terms_id)}
              />
              <label htmlFor={`agree-${term.terms_id}`} className="term_agreement_label">
                {term.terms_type}에 동의합니다.
              </label>
            </div>
            <div className="term_text_box">
              <div className="term_section_title">{term.terms_type}</div>
              <div className="term_text">
                <p>{term.terms_content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="term_buttons">
        <button onClick={handleAgree} className="term_button_next">
          Next
        </button>
        <button onClick={() => navigate('/')} className="term_button_cancel">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Terms;
