CREATE OR REPLACE FUNCTION refresh_shop_review_metrics()
RETURNS TRIGGER AS $$
DECLARE
  target_shop_id BIGINT;
BEGIN
  target_shop_id := COALESCE(NEW.shop_id, OLD.shop_id);

  IF target_shop_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM shop_reviews sr
    WHERE sr.shop_id = target_shop_id
      AND sr.is_hidden IS NOT TRUE
  ) THEN
    DELETE FROM shop_review_metrics
    WHERE shop_id = target_shop_id;

    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO shop_review_metrics (
    shop_id,
    review_count,
    average_rating,
    rating_1_count,
    rating_2_count,
    rating_3_count,
    rating_4_count,
    rating_5_count,
    last_reviewed_at,
    updated_at
  )
  SELECT
    sr.shop_id,
    COUNT(*)::int AS review_count,
    ROUND(AVG(sr.rating)::numeric, 2) AS average_rating,
    COUNT(*) FILTER (WHERE sr.rating = 1)::int AS rating_1_count,
    COUNT(*) FILTER (WHERE sr.rating = 2)::int AS rating_2_count,
    COUNT(*) FILTER (WHERE sr.rating = 3)::int AS rating_3_count,
    COUNT(*) FILTER (WHERE sr.rating = 4)::int AS rating_4_count,
    COUNT(*) FILTER (WHERE sr.rating = 5)::int AS rating_5_count,
    MAX(sr.created_at) AS last_reviewed_at,
    NOW() AS updated_at
  FROM shop_reviews sr
  WHERE sr.shop_id = target_shop_id
    AND sr.is_hidden IS NOT TRUE
  GROUP BY sr.shop_id
  ON CONFLICT (shop_id) DO UPDATE SET
    review_count = EXCLUDED.review_count,
    average_rating = EXCLUDED.average_rating,
    rating_1_count = EXCLUDED.rating_1_count,
    rating_2_count = EXCLUDED.rating_2_count,
    rating_3_count = EXCLUDED.rating_3_count,
    rating_4_count = EXCLUDED.rating_4_count,
    rating_5_count = EXCLUDED.rating_5_count,
    last_reviewed_at = EXCLUDED.last_reviewed_at,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_shop_review_metrics ON shop_reviews;

CREATE TRIGGER trg_refresh_shop_review_metrics
AFTER INSERT OR UPDATE OF shop_id, rating, is_hidden, created_at OR DELETE
ON shop_reviews
FOR EACH ROW
EXECUTE FUNCTION refresh_shop_review_metrics();

INSERT INTO shop_review_metrics (
  shop_id,
  review_count,
  average_rating,
  rating_1_count,
  rating_2_count,
  rating_3_count,
  rating_4_count,
  rating_5_count,
  last_reviewed_at,
  updated_at
)
SELECT
  sr.shop_id,
  COUNT(*)::int AS review_count,
  ROUND(AVG(sr.rating)::numeric, 2) AS average_rating,
  COUNT(*) FILTER (WHERE sr.rating = 1)::int AS rating_1_count,
  COUNT(*) FILTER (WHERE sr.rating = 2)::int AS rating_2_count,
  COUNT(*) FILTER (WHERE sr.rating = 3)::int AS rating_3_count,
  COUNT(*) FILTER (WHERE sr.rating = 4)::int AS rating_4_count,
  COUNT(*) FILTER (WHERE sr.rating = 5)::int AS rating_5_count,
  MAX(sr.created_at) AS last_reviewed_at,
  NOW() AS updated_at
FROM shop_reviews sr
WHERE sr.is_hidden IS NOT TRUE
GROUP BY sr.shop_id
ON CONFLICT (shop_id) DO UPDATE SET
  review_count = EXCLUDED.review_count,
  average_rating = EXCLUDED.average_rating,
  rating_1_count = EXCLUDED.rating_1_count,
  rating_2_count = EXCLUDED.rating_2_count,
  rating_3_count = EXCLUDED.rating_3_count,
  rating_4_count = EXCLUDED.rating_4_count,
  rating_5_count = EXCLUDED.rating_5_count,
  last_reviewed_at = EXCLUDED.last_reviewed_at,
  updated_at = NOW();
