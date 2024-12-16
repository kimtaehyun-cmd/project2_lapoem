import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard'; // 사이드 네비게이션
import Header from './components/Header'; // 헤더
import Main from './components/Main/Main'; // 메인 컨텐츠
import './App.css';
import BooksManageing from './components/adminBooks/BooksManageing';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Dashboard /> {/* 사이드 네비게이션 */}
        <Header /> {/* 상단 헤더 */}
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/books/new" element={<BooksManageing />} />
            {/* 다른 페이지 라우팅을 추가할 수 있습니다 */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
