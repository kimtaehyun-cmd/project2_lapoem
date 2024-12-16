import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './Common.css';
import SerchIcon from '../../assets/images/searchIcon.png';

const SearchBar = ({ apiUrl, onSearch }) => {
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); // Enter 키를 누르면 검색
    }
  };

  return (
    <div className="searchbar">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyPress={handleKeyPress} // Enter 키 입력 시 검색
        placeholder="검색할 도서명 혹은 저자를 입력해주세요."
      />
      <div className="divider"></div>
      <button onClick={handleSearch}>
        <img src={SerchIcon} alt="search_icon" className="search_icon" />
      </button>
    </div>
  );
};

SearchBar.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
