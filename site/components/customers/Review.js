import React from "react";
import StarRating from "../../reusables/star";

export default function Reviews() {
  return (
    <div className="pdp-reviews">
      <h2 className="pdp-reviews__heading">Reviews</h2>
      <section className="pdp-reviews__row">
        <div className="pdp-reviews__ratings">
          <h3 className="pdp-reviews__subheading">
            Verified rating (0)
          </h3>
          <div className="pdp-reviews__summary-panel">
            <p className="pdp-reviews__score">4.5/5.0</p>
            <div className="pdp-reviews__stars">
              <StarRating rating={4.5} starRatedColor="#00926E" />
            </div>
            <p className="pdp-reviews__count">19 verified reviews</p>
          </div>
        </div>

        <div className="pdp-reviews__comments">
          <h3 className="pdp-reviews__subheading">
            Comments from verified purchases (0)
          </h3>
          <div className="pdp-reviews__comment-card">
            <div className="pdp-reviews__comment-stars">
              <StarRating rating={4.5} starRatedColor="#00926E" />
            </div>
            <p className="pdp-reviews__comment-title">Original and effective</p>
            <p className="pdp-reviews__comment-body">All smells great</p>
            <div className="pdp-reviews__comment-meta">
              <small>
                {new Date().toUTCString()}&nbsp; By Chinedu
              </small>
              <small className="pdp-reviews__verified">Verified purchase</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
