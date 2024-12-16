import React from 'react';
import './pageNation.css';
import l_arrow from '../assets/logo/l_arrow.png';
import r_arrow from '../assets/logo/r_arrow.png';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // 페이지 버튼 생성
  const renderPaginationButtons = () => {
    const pageButtons = [];
    const maxVisiblePages = 5; // 최대 5개 페이지 버튼
    const startPage =
      Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1; // 현재 페이지에 따라 시작 페이지 결정
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages); // 끝 페이지 결정

    for (let page = startPage; page <= endPage; page++) {
      pageButtons.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={currentPage === page ? 'active' : ''}
        >
          {page}
        </button>
      );
    }

    return pageButtons;
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <img src={l_arrow} alt="left_arrow" />
      </button>
      {renderPaginationButtons()}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <img src={r_arrow} alt="rightt_arrow" />
      </button>
    </div>
  );
};
export default Pagination;
