// components/StarRating.js
import React from "react";
import StarRatings from 'react-star-ratings';

const StarRating = ({
  rating,
  changeRating,
  starRatedColor = "orangered",
  starEmptyColor = "#d0d0d0",
}) => {
  return (
    <div>
      <StarRatings
        rating={rating}
        starRatedColor={starRatedColor}
        starEmptyColor={starEmptyColor}
        numberOfStars={5}
        name="rating"
        starDimension="20px"
        starSpacing="2px"
        changeRating={
          typeof changeRating === "function" ? changeRating : () => {}
        }
      />
    </div>
  );
};

export default StarRating;