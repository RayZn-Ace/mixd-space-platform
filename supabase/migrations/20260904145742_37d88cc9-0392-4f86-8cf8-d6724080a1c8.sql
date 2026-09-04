DO $$
DECLARE loc uuid := '11111111-1111-1111-1111-111111111111';
BEGIN

INSERT INTO public.spaces (id, location_id, name, slug, space_type, description, capacity, size_sqm, floor, room_number, status, sort_order, min_booking_minutes) VALUES
 ('21111111-0000-0000-0000-000000000010', loc, 'Study Lounge Desk', 'study-lounge-desk', 'flex_desk', 'Ruhiger Einzelplatz in der Study Lounge. Perfekt für Lernsessions, Hausarbeiten und Deep Work.', 1, 6, 'EG', 'SL-01', 'active', 8, 60),
 ('21111111-0000-0000-0000-000000000011', loc, 'Window Desk', 'window-desk', 'flex_desk', 'Flex Desk direkt am Fenster mit viel Tageslicht und Blick ins Grüne.', 1, 6, 'EG', 'WD-02', 'active', 9, 60),
 ('21111111-0000-0000-0000-000000000012', loc, 'Focus Booth', 'focus-booth', 'private_office', 'Schallgedämmte Einzelkabine für Calls, Prüfungsvorbereitung und konzentriertes Arbeiten.', 1, 5, 'EG', 'FB-01', 'active', 10, 30),
 ('21111111-0000-0000-0000-000000000013', loc, 'Studio Office', 'studio-office', 'private_office', 'Privates Büro für zwei bis drei Personen, möbliert und sofort bezugsfertig.', 3, 14, '1. OG', 'PO-03', 'active', 11, 60),
 ('21111111-0000-0000-0000-000000000014', loc, 'Workshop Loft', 'workshop-loft', 'workshop_space', 'Großer offener Raum für Workshops, Lerngruppen, Pitch-Nights und Community-Events.', 30, 70, '1. OG', 'WL-01', 'active', 12, 120),
 ('21111111-0000-0000-0000-000000000015', loc, 'Huddle Room', 'huddle-room', 'meeting_room', 'Kleiner Meetingraum für vier Personen mit Whiteboard und Screen.', 4, 12, 'EG', 'MR-02', 'active', 13, 30),
 ('21111111-0000-0000-0000-000000000016', loc, 'Creative Lab', 'creative-lab', 'team_office', 'Flexibler Teamraum mit beweglichen Möbeln, Moderationswand und viel Platz für Ideen.', 8, 28, '1. OG', 'TO-02', 'active', 14, 60)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pricing_rules (space_id, location_id, rate_type, price_cents, currency, min_units, priority, active) VALUES
 ('21111111-0000-0000-0000-000000000010', loc, 'hourly', 450, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000010', loc, 'daily', 1900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000010', loc, 'monthly', 19900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000011', loc, 'hourly', 500, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000011', loc, 'daily', 2200, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000012', loc, 'hourly', 700, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000012', loc, 'daily', 3500, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000013', loc, 'daily', 6900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000013', loc, 'monthly', 79900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000014', loc, 'hourly', 6900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000014', loc, 'daily', 39000, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000015', loc, 'hourly', 1900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000015', loc, 'daily', 11900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000016', loc, 'daily', 14900, 'EUR', 1, 10, true),
 ('21111111-0000-0000-0000-000000000016', loc, 'monthly', 149900, 'EUR', 1, 10, true);

INSERT INTO public.space_amenities (space_id, amenity_id)
SELECT s.id, a.id
FROM public.spaces s
JOIN public.amenities a ON a.slug = ANY (
  CASE s.slug
    WHEN 'study-lounge-desk' THEN ARRAY['wifi','coffee','natural-light']
    WHEN 'window-desk' THEN ARRAY['wifi','natural-light','standing-desk']
    WHEN 'focus-booth' THEN ARRAY['wifi','monitor','video']
    WHEN 'studio-office' THEN ARRAY['wifi','monitor','parking','natural-light']
    WHEN 'workshop-loft' THEN ARRAY['wifi','whiteboard','coffee','natural-light']
    WHEN 'huddle-room' THEN ARRAY['wifi','whiteboard','video']
    WHEN 'creative-lab' THEN ARRAY['wifi','whiteboard','monitor','coffee']
  END
)
WHERE s.id IN (
 '21111111-0000-0000-0000-000000000010','21111111-0000-0000-0000-000000000011','21111111-0000-0000-0000-000000000012',
 '21111111-0000-0000-0000-000000000013','21111111-0000-0000-0000-000000000014','21111111-0000-0000-0000-000000000015',
 '21111111-0000-0000-0000-000000000016')
ON CONFLICT DO NOTHING;

END $$;