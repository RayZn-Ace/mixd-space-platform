update public.spaces set name='Focus Desk', slug='focus-desk', size_sqm=coalesce(size_sqm,6) where code='DESK.01';
update public.spaces set name='Quiet Desk', slug='quiet-desk', size_sqm=coalesce(size_sqm,6) where code='DESK.02';
update public.spaces set name='Coffee Bar Desk', slug='coffee-bar-desk', size_sqm=coalesce(size_sqm,6) where code='DESK.03';
update public.spaces set name='Call Office', slug='call-office', size_sqm=coalesce(size_sqm,9) where code='OFFICE.01';
update public.spaces set name='Project Office', slug='project-office', size_sqm=coalesce(size_sqm,16) where code='OFFICE.02';
update public.spaces set name='Team Office', slug='team-office', size_sqm=coalesce(size_sqm,32) where code='TEAM.01';
update public.spaces set name='Boardroom', slug='boardroom', size_sqm=coalesce(size_sqm,24) where code='MEET.01';