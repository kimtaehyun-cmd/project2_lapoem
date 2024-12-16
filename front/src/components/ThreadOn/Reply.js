import React from "react";
import { DELETE_THREAD_COMMENTS_API_URL } from "../../util/apiUrl";
import "./commentReplyStyles.css";
import deleteIcon from "../../assets/images/delete.png";

const Reply = ({ reply, isAuthor, memberNum, onDelete }) => {
  // console.log("Reply component data:", reply); // 전달된 데이터 확인

  // 대댓글 삭제 함수
  const handleDeleteReply = async () => {
    if (window.confirm("정말로 대댓글을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(
          DELETE_THREAD_COMMENTS_API_URL(reply.thread_content_num),
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              member_num: memberNum, // 프론트엔드에서 memberNum을 member_num으로 변환하여 전송
            }),
          }
        );

        if (response.ok) {
          console.log("대댓글이 성공적으로 삭제되었습니다.");
          onDelete(reply.thread_content_num); // 삭제된 대댓글의 ID를 부모 컴포넌트에 전달
        } else {
          console.error("대댓글 삭제 실패");
        }
      } catch (error) {
        console.error("Error deleting reply:", error);
      }
    }
  };

  return (
    <div className="reply-container">
      {/* 대댓글을 부모 댓글과 시각적으로 연결하는 좌측 회색 라인 */}
      <div className="reply-line"></div>

      <div className="reply-content">
        <div className="reply-header">
          <div className="reply-header-left">
            <span className="reply-nickname">{reply.member_nickname}</span>
            <span className="reply-date">{reply.created_at}</span>
          </div>
          {/* 본인이 작성한 대댓글일 때만 삭제 버튼 표시 */}
          {isAuthor && (
            <button onClick={handleDeleteReply} className="reply-delete-button">
              <img src={deleteIcon} alt="삭제" />
            </button>
          )}
        </div>
        <div className="reply-text">{reply.thread_content}</div>
      </div>
    </div>
  );
};

export default Reply;
