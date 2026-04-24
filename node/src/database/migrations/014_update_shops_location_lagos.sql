-- Set every shop location to Lagos State with real lat/lng (cycles through neighborhoods).

UPDATE shops AS s
SET
  location = u.new_loc,
  updatedat = CURRENT_TIMESTAMP
FROM (
  SELECT
    z.id,
    jsonb_build_object(
      'address', pt.area || ', Lagos State, Nigeria',
      'city', 'Lagos',
      'state', 'Lagos',
      'country', 'Nigeria',
      'zipcode', NULL::text,
      'coordinates', jsonb_build_object('lat', pt.lat, 'lng', pt.lng)
    ) AS new_loc
  FROM (
    SELECT id, (ROW_NUMBER() OVER (ORDER BY id) - 1) AS ord
    FROM shops
  ) AS z
  INNER JOIN (
    SELECT * FROM (VALUES
      (0, 6.6018::double precision, 3.3515::double precision, 'Ikeja'),
      (1, 6.4281, 3.4219, 'Victoria Island'),
      (2, 6.4474, 3.4734, 'Lekki Phase 1'),
      (3, 6.5086, 3.3714, 'Yaba'),
      (4, 6.5006, 3.351, 'Surulere'),
      (5, 6.4488, 3.359, 'Apapa'),
      (6, 6.5244, 3.35, 'Mushin'),
      (7, 6.6156, 3.3252, 'Agege'),
      (8, 6.6194, 3.5105, 'Ikorodu'),
      (9, 6.4682, 3.6015, 'Ajah'),
      (10, 6.5535, 3.3342, 'Oshodi'),
      (11, 6.47, 3.2, 'Festac Town'),
      (12, 6.4541, 3.3947, 'Lagos Island'),
      (13, 6.5444, 3.3847, 'Gbagada'),
      (14, 6.4698, 3.5852, 'Sangotedo')
    ) AS t(idx, lat, lng, area)
  ) AS pt ON pt.idx = (z.ord % 15)
) AS u
WHERE s.id = u.id;
