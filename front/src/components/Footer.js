import React from 'react';
import './Footer.css';
import lapoem_logo from '../assets/images/lopoem_logo.png';

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-left">
        <div className="footer-logo">
          <img src={lapoem_logo} alt="LOGO Images" />
        </div>
        <div className="footer-info">
          <p>대표 최아무개</p>
          <p>대표 번호 010-1010-1010</p>
          <p>사업자등록번호 000-00-000000</p>
          <p>
            가산디지털로 144 대륭테크타워 가산디지털단지 A동 20F 2013-2018호
          </p>
        </div>
      </div>
      <div className="footer-right">
        <div className="footer-right-top">
          <p>이용약관</p>
          <p>개인정보처리방침</p>
          <p>고객센터 000-000-000</p>
        </div>
        <div className="footer-right-bottom">
          <p>COPYRIGHT© 2023 Akcc_LaPoreme Co., Ltd. ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
