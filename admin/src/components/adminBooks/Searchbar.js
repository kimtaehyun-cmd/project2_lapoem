import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import SeachIcon from '../assets/logo/search_icon.png';
import './Books.css';

const Searchbar = ({ apiUrl, onSearch }) => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = async () => {
    if (keyword.trim() === '') return;

    try {
      const response = await axios.get(apiUrl, {
        params: { keyword },
      });
      onSearch(response.data, keyword); // 검색어와 함께 검색 결과 전달
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleKeyDown = (e) => {
    // Enter 키가 눌리면 handleSearch 함수를 호출
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown} // Enter 키 입력 시 검색 수행
        placeholder="책 제목 또는 저자 검색..."
      />
      <button onClick={handleSearch}>
        <img src={SeachIcon} alt="" />
      </button>
    </div>
  );
};

Searchbar.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default Searchbar;
