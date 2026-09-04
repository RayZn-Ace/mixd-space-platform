ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS code text;

WITH numbered AS (
  SELECT s.id,
         CASE s.space_type
           WHEN 'flex_desk' THEN 'DESK'
           WHEN 'dedicated_desk' THEN 'DESK'
           WHEN 'private_office' THEN 'OFFICE'
           WHEN 'team_office' THEN 'TEAM'
           WHEN 'meeting_room' THEN 'MEET'
           WHEN 'workshop_space' THEN 'CREATE'
           ELSE 'MIXD'
         END AS prefix,
         row_number() OVER (
           PARTITION BY s.location_id,
             CASE s.space_type
               WHEN 'flex_desk' THEN 'DESK'
               WHEN 'dedicated_desk' THEN 'DESK'
               WHEN 'private_office' THEN 'OFFICE'
               WHEN 'team_office' THEN 'TEAM'
               WHEN 'meeting_room' THEN 'MEET'
               WHEN 'workshop_space' THEN 'CREATE'
               ELSE 'MIXD'
             END
           ORDER BY s.sort_order, s.created_at
         ) AS n
  FROM public.spaces s
)
UPDATE public.spaces s
SET code = numbered.prefix || '.' || lpad(numbered.n::text, 2, '0')
FROM numbered
WHERE numbered.id = s.id AND (s.code IS NULL OR s.code = '');

CREATE UNIQUE INDEX IF NOT EXISTS spaces_location_code_key ON public.spaces (location_id, code) WHERE code IS NOT NULL;