import React, { useState } from "react";
import "./replymodal.css";
import { POST_THREAD_REPLY_API_URL } from "../../util/apiUrl";
import { useNavigate } from "react-router-dom"; // useNavigate로 변경

const ReplyModal = ({ comment, thread_num, onClose, onSubmit, memberNum }) => {
  const [replyContent, setReplyContent] = useState("");
  const navigate = useNavigate(); // useHistory 대신 useNavigate 사용

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value);
    console.log("Current replyContent:", e.target.value); // 현재 입력된 대댓글 내용 확인
    console.log("replyContent length:", e.target.value.length); // 대댓글 길이 로그 출력
  };

  const handleReplySubmit = async () => {
    console.log("handleReplySubmit called"); // 함수 호출 확인
    console.log("memberNum:", memberNum);
    console.log("thread_num:", thread_num);
    console.log("comment.thread_content_num:", comment.thread_content_num);
    console.log("replyContent:", replyContent);
    console.log("replyContent length:", replyContent.length); // 최종 길이 확인

    if (replyContent.length >= 10 && replyContent.length <= 300) {
      try {
        const response = await fetch(
          POST_THREAD_REPLY_API_URL(thread_num, comment.thread_content_num),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              thread_content: replyContent, // 대댓글 내용 전송 시 thread_content로 설정
              member_num: memberNum, // 로그인된 사용자의 member_num을 포함
              thread_content_num2: comment.thread_content_num, // 부모 댓글의 ID를 thread_content_num2로 전송
            }),
          }
        );

        console.log("Response status:", response.status); // 응답 상태 확인
        const responseData = await response.json();
        console.log("Response data:", responseData); // 응답 데이터 확인

        if (response.ok) {
          console.log("Reply submitted successfully");
          onSubmit(replyContent); // 대댓글 내용 부모 컴포넌트로 전달
          setReplyContent("");
          onClose(); // 모달 닫기
        } else {
          console.error("Failed to submit reply:", responseData.message);
          alert("대댓글 등록에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        console.error("Error submitting reply:", error);
        alert(
          "오류가 발생했습니다. 네트워크를 확인하거나 잠시 후 다시 시도해주세요."
        );
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Leave a Reply</h3>
          <button className="close-button" onClick={onClose}>
            ✖
          </button>
        </div>
        <div className="parent-comment-info">
          <p className="parent-nickname">{comment.member_nickname}</p>
          <p className="parent-date">{comment.created_at}</p>
          <p className="parent-content">{comment.thread_content}</p>
        </div>
        <textarea
          className="reply-input"
          placeholder="대댓글을 입력하세요 (최소 10자, 최대 300자)"
          value={replyContent}
          onChange={handleReplyChange}
          maxLength={300}
        />
        <button
          className="submit-reply-button"
          onClick={handleReplySubmit}
          disabled={replyContent.length < 10 || replyContent.length > 300}
        >
          Reply
        </button>
      </div>
    </div>
  );
};

export default ReplyModal;
