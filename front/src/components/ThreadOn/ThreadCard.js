import React from "react";
import "./Threadcard.css";

import Default from "../../assets/images/default-cover.png";
import Thread_i from "../../assets/images/thread-i.png";

function ThreadCard({
  cover,
  title,
  author,
  publisher,
  participantsCount,
  onClick,
}) {
  return (
    <div className="thread-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="thread-wrapper">
        <div className="thread-thumbnail">
          <img src={cover || Default} alt="책 썸네일" />
        </div>

        <div className="thread-info-wrapper">
          <div className="thread-tag">
            현재 {participantsCount || 0}명 참여 중
          </div>
          <img src={Thread_i} alt="아이콘" className="thread-icon" />

          <div className="thread-info">
            <p className="thread-title">{title}</p>
            {/* <p className="thread-title">채식주의자(리마스터판)</p> */}

            <div className="thread-writer">
              <p>{`${author} · ${publisher}`}</p>
            </div>
            {/* <div className="thread-writer">
              <p>한강</p>
              <p>·</p>
              <p>창비</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreadCard;
