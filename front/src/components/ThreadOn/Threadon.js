import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ThreadCard from "./ThreadCard";
import SearchBar from "../Common/SearchBar";
import PageNation from "../PageNation";
import "./Threadon.css";
import {
  GET_SEARCH_THREADS_API_URL,
  GET_THREADS_API_URL,
} from "../../util/apiUrl";
import reset from "../../assets/images/reset.png";

function Threadon() {
  const [threads, setThreads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0); // 전체 항목 수 추가
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // 검색어가 빈 문자열일 경우 전체 목록을 요청
  useEffect(() => {
    if (searchTerm === "") {
      fetchThreads();
    }
  }, [searchTerm]);

  // 현재 페이지가 변경될 때마다 목록을 요청
  useEffect(() => {
    fetchThreads();
  }, [currentPage]);

  // 스레드 데이터를 불러오는 함수
  const fetchThreads = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(GET_THREADS_API_URL, {
        params: {
          page: currentPage, // 현재 페이지 번호(몇 번째 페이지를 가져올지.)
          limit: itemsPerPage, // 한 페이지에 표시할 스레드 수 (한 페이지에 몇 개의 스레드를 보여줄지.)
          query: searchTerm || "", // 검색어 (없으면 전체 목록 불러오기/ 사용자가 입력한 검색어(필터 조건).)
        },
      });
      setThreads(response.data.threads);
      setTotalCount(response.data.totalCount); // totalCount 설정
      setLoading(false);
    } catch (err) {
      console.error("Error fetching threads:", err);
      setError("데이터를 불러오는 중 문제가 발생했습니다.");
      setLoading(false);
    }
  };

  // 검색어가 업데이트되었을 때의 핸들러
  const handleSearch = (data) => {
    if (typeof data === "string") {
      setSearchTerm(data); // 검색어로 검색
      setCurrentPage(1);
      fetchThreads(); // 검색어가 업데이트된 후 목록을 불러옴
    } else {
      setThreads(data.threads || []);
      setTotalCount(data.totalCount || 0);
    }
  };

  // 전체 보기 핸들러
  const handleReset = () => {
    console.log("Reset button clicked"); // 콘솔 로그 추가
    setSearchTerm(""); // 검색어 초기화
    setCurrentPage(1); // 페이지도 초기화
    fetchThreads(); // 전체 목록 불러오기
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="thread-container">
      <h1 className="thread-header">THREAD ON</h1>

      <div className="thread-search-bar">
        <div className="search-bar-container">
          <SearchBar
            apiUrl={GET_SEARCH_THREADS_API_URL}
            onSearch={handleSearch}
          />
          <button className="thread-reset-button" onClick={handleReset}>
            <img src={reset} alt="Reset" />
          </button>
        </div>
        <button
          className="thread-new-thread-button"
          onClick={() => {
            if (isLoggedIn) {
              navigate("/new_thread");
            } else {
              const confirmed = window.confirm(
                "회원 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
              );
              if (confirmed) {
                navigate("/login");
              }
            }
          }}
        >
          New Thread
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="thread-list">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.thread_num}
              cover={thread.book_cover}
              title={thread.book_title}
              author={thread.book_author}
              publisher={thread.book_publisher}
              participantsCount={thread.participant_count}
              onClick={() => {
                console.log(`Navigating to thread ${thread.thread_num}`);
                navigate(`/threads/${thread.thread_num}`);
              }}
            />
          ))}
          {Array.from({ length: itemsPerPage - threads.length }).map(
            (_, index) => (
              <div key={`empty-${index}`} className="thread-card-placeholder" />
            )
          )}
        </div>
      )}

      <div className="page-nation-container">
        <PageNation
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            console.log("Page changed to:", page);
            setCurrentPage(page);
          }}
        />
      </div>
    </div>
  );
}

export default Threadon;
