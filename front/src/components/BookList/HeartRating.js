import React from 'react';
import heartRating from '../../assets/images/heart-rating.png';
import heartRatingEmpty from '../../assets/images/heart-rating-empty.png';

const HeartRating = ({ rating }) => {
  const renderHearts = () => {
    const hearts = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating / 2) {
        hearts.push(
          <img
            key={i}
            src={heartRating}
            alt={`filled-heart-${i}`}
            className="heart-icon"
          />
        );
      } else {
        hearts.push(
          <img
            key={i}
            src={heartRatingEmpty}
            alt={`empty-heart-${i}`}
            className="heart-icon"
          />
        );
      }
    }
    return hearts;
  };

  return <div className="heart-rating">{renderHearts()}</div>;
};

export default HeartRating;
