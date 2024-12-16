import React, { useState } from 'react';
import BookList from './BookList';
import CreateNewBook from './CreateNewBook';
import './Books.css';

const BooksManageing = () => {
  // 팝업 창이 열려 있는지 여부를 관리하는 상태
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // 팝업 창을 여는 함수
  const openPopup = () => {
    setIsPopupOpen(true);
  };

  // 팝업 창을 닫는 함수
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="book_container">
      <div className="pege_title">
        <h2>도서 목록</h2>
      </div>
      <div className="book_info">
        <BookList />
      </div>
      <div className="create_new_book">
        {/* CreateNewBook 버튼을 클릭하면 openPopup 함수 호출 */}
        <button onClick={openPopup}>신간 도서 등록</button>
      </div>

      {/* 팝업 창이 열려 있을 때만 CreateNewBook 컴포넌트를 렌더링 */}
      {isPopupOpen && (
        <div className="popup_overlay">
          <div className="popup_wrapper">
            <div className="popup_content">
              <div className="create_book_pop_title_area">
                <h2>ADD BOOK INFOMATION</h2>
              </div>
              {/* <button className="close_button" onClick={closePopup}>
                닫기
              </button> */}
              <CreateNewBook onClose={closePopup} />
              {/* onClose를 closePopup으로 전달 */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksManageing;
