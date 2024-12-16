import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "./assets/logo/logo-w.png";
import "./Dashboard.css";
import { LuMinus, LuPlus } from "react-icons/lu";
import { BsPersonFill } from "react-icons/bs";
import { MdBook, MdSettings, MdKeyboardArrowRight } from "react-icons/md";
import { IoEllipsisHorizontalCircleSharp } from "react-icons/io5";

const Dashboard = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({
    member: true, // 기본으로 '회원 관리' 탭이 열리도록 설정
    book: false,
    content: false,
    community: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prevSections) => ({
      ...prevSections,
      [section]: !prevSections[section],
    }));
  };

  return (
    <div className="Dashboard_wrapper">
      <div className="logo">
        <img src={logo} alt="로고 이미지" />
      </div>

      <div className="menu-section">
        <Link
          to="/"
          className={`menu-item ${openSections.member ? "open" : ""}`}
        >
          <BsPersonFill className="icon" />
          <span>회원 관리</span>
        </Link>
      </div>

      <div className="menu-section">
        <div
          className={`menu-item ${openSections.book ? "open" : ""}`}
          onClick={() => toggleSection("book")}
        >
          <MdBook className="icon" />
          <span>도서 관리</span>
          {openSections.book ? <LuMinus /> : <LuPlus />}
        </div>
        {openSections.book && (
          <div className="submenu-container">
            <Link
              to="/books/new"
              className={`submenu-item ${
                location.pathname === "/books/new" ? "active" : ""
              }`}
            >
              {location.pathname === "/books/new" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              신간 도서 등록
            </Link>
            <Link
              to="/books/bestsellers"
              className={`submenu-item ${
                location.pathname === "/books/bestsellers" ? "active" : ""
              }`}
            >
              {location.pathname === "/books/bestsellers" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              베스트셀러 등록
            </Link>
            <Link
              to="/books/rpa"
              className={`submenu-item ${
                location.pathname === "/books/rpa" ? "active" : ""
              }`}
            >
              {location.pathname === "/books/rpa" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              RPA 관리
            </Link>
          </div>
        )}
      </div>

      <div className="menu-section">
        <div
          className={`menu-item ${openSections.content ? "open" : ""}`}
          onClick={() => toggleSection("content")}
        >
          <MdSettings className="icon" />
          <span>콘텐츠 관리</span>
          {openSections.content ? <LuMinus /> : <LuPlus />}
        </div>
        {openSections.content && (
          <div className="submenu-container">
            <Link
              to="/content/reviews"
              className={`submenu-item ${
                location.pathname === "/content/reviews" ? "active" : ""
              }`}
            >
              {location.pathname === "/content/reviews" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              도서 리뷰 관리
            </Link>
            <Link
              to="/content/threadon"
              className={`submenu-item ${
                location.pathname === "/content/threadon" ? "active" : ""
              }`}
            >
              {location.pathname === "/content/threadon" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              스레드 온 관리
            </Link>
          </div>
        )}
      </div>

      <div className="menu-section">
        <div
          className={`menu-item ${openSections.community ? "open" : ""}`}
          onClick={() => toggleSection("community")}
        >
          <IoEllipsisHorizontalCircleSharp className="icon" />
          <span>커뮤니티 관리</span>
          {openSections.community ? <LuMinus /> : <LuPlus />}
        </div>
        {openSections.community && (
          <div className="submenu-container">
            <Link
              to="/community/notice"
              className={`submenu-item ${
                location.pathname === "/community/notice" ? "active" : ""
              }`}
            >
              {location.pathname === "/community/notice" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              공지사항 관리
            </Link>
            <Link
              to="/community/posts"
              className={`submenu-item ${
                location.pathname === "/community/posts" ? "active" : ""
              }`}
            >
              {location.pathname === "/community/posts" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              게시글 관리
            </Link>
            <Link
              to="/community/comments"
              className={`submenu-item ${
                location.pathname === "/community/comments" ? "active" : ""
              }`}
            >
              {location.pathname === "/community/comments" && (
                <MdKeyboardArrowRight className="arrow-icon" />
              )}
              댓글 관리
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
