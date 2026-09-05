
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE public.app_role AS ENUM ('customer','company_member','company_admin','staff','admin','super_admin');
CREATE TYPE public.space_type AS ENUM ('flex_desk','dedicated_desk','private_office','team_office','meeting_room','workshop_space','other');
CREATE TYPE public.space_status AS ENUM ('active','inactive','maintenance');
CREATE TYPE public.rate_type AS ENUM ('hourly','daily','weekly','monthly','weekend','evening','member','corporate');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','checked_in','completed','cancelled','no_show');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded','partially_refunded');
CREATE TYPE public.addon_price_type AS ENUM ('per_booking','per_hour','per_day','per_person');
CREATE TYPE public.discount_type AS ENUM ('percentage','fixed_amount');
CREATE TYPE public.notification_type AS ENUM ('booking','payment','access','membership','company','system');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  company_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('staff','admin','super_admin'))
$$;

CREATE OR REPLACE FUNCTION public.current_company_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()) OR (company_id IS NOT NULL AND company_id = public.current_company_id() AND public.has_role(auth.uid(),'company_admin')));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name) VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- locations
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Deutschland',
  latitude NUMERIC,
  longitude NUMERIC,
  timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
  hero_image_url TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  parking_info TEXT,
  getting_there TEXT,
  opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  access_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_email TEXT,
  contact_phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_public_read" ON public.locations FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
CREATE POLICY "locations_staff_write" ON public.locations FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- spaces
CREATE TABLE public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  space_type public.space_type NOT NULL,
  description TEXT,
  capacity INTEGER,
  size_sqm NUMERIC,
  floor TEXT,
  room_number TEXT,
  hero_image_url TEXT,
  rules TEXT,
  min_booking_minutes INTEGER NOT NULL DEFAULT 60,
  status public.space_status NOT NULL DEFAULT 'active',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spaces TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spaces TO authenticated;
GRANT ALL ON public.spaces TO service_role;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spaces_public_read" ON public.spaces FOR SELECT USING (status = 'active' OR public.is_staff(auth.uid()));
CREATE POLICY "spaces_staff_write" ON public.spaces FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_spaces_updated BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.space_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.space_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.space_images TO authenticated;
GRANT ALL ON public.space_images TO service_role;
ALTER TABLE public.space_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "space_images_public_read" ON public.space_images FOR SELECT USING (true);
CREATE POLICY "space_images_staff_write" ON public.space_images FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.amenities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.amenities TO authenticated;
GRANT ALL ON public.amenities TO service_role;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "amenities_public_read" ON public.amenities FOR SELECT USING (true);
CREATE POLICY "amenities_staff_write" ON public.amenities FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.space_amenities (
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (space_id, amenity_id)
);
GRANT SELECT ON public.space_amenities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.space_amenities TO authenticated;
GRANT ALL ON public.space_amenities TO service_role;
ALTER TABLE public.space_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "space_amenities_public_read" ON public.space_amenities FOR SELECT USING (true);
CREATE POLICY "space_amenities_staff_write" ON public.space_amenities FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- pricing
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  rate_type public.rate_type NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  min_units INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_rules TO authenticated;
GRANT ALL ON public.pricing_rules TO service_role;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing_public_read" ON public.pricing_rules FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
CREATE POLICY "pricing_staff_write" ON public.pricing_rules FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  weekday SMALLINT,
  opens_at TIME NOT NULL DEFAULT '08:00',
  closes_at TIME NOT NULL DEFAULT '20:00',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.availability_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability_rules TO authenticated;
GRANT ALL ON public.availability_rules TO service_role;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_public_read" ON public.availability_rules FOR SELECT USING (true);
CREATE POLICY "availability_staff_write" ON public.availability_rules FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blocked_times TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_times TO authenticated;
GRANT ALL ON public.blocked_times TO service_role;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked_public_read" ON public.blocked_times FOR SELECT USING (true);
CREATE POLICY "blocked_staff_write" ON public.blocked_times FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_address TEXT,
  vat_id TEXT,
  billing_email TEXT,
  credit_limit_cents INTEGER,
  monthly_budget_cents INTEGER,
  payment_terms TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_read" ON public.companies FOR SELECT TO authenticated USING (id = public.current_company_id() OR public.is_staff(auth.uid()));
CREATE POLICY "companies_staff_write" ON public.companies FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  monthly_limit_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_members_read" ON public.company_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR company_id = public.current_company_id() OR public.is_staff(auth.uid()));
CREATE POLICY "company_members_admin_write" ON public.company_members FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) OR (company_id = public.current_company_id() AND public.has_role(auth.uid(),'company_admin')))
  WITH CHECK (public.is_staff(auth.uid()) OR (company_id = public.current_company_id() AND public.has_role(auth.uid(),'company_admin')));

-- memberships
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  included_credits INTEGER NOT NULL DEFAULT 0,
  included_days INTEGER NOT NULL DEFAULT 0,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  allowed_space_types public.space_type[] NOT NULL DEFAULT '{}',
  minimum_duration_months INTEGER NOT NULL DEFAULT 1,
  cancellation_rules TEXT,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.memberships TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships_public_read" ON public.memberships FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
CREATE POLICY "memberships_staff_write" ON public.memberships FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_subscriptions TO authenticated;
GRANT ALL ON public.membership_subscriptions TO service_role;
ALTER TABLE public.membership_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_read" ON public.membership_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR (company_id IS NOT NULL AND company_id = public.current_company_id()) OR public.is_staff(auth.uid()));
CREATE POLICY "subs_insert_own" ON public.membership_subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "subs_staff_write" ON public.membership_subscriptions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- addons
CREATE TABLE public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  price_type public.addon_price_type NOT NULL DEFAULT 'per_booking',
  allowed_space_types public.space_type[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.addons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addons TO authenticated;
GRANT ALL ON public.addons TO service_role;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addons_public_read" ON public.addons FOR SELECT USING (active = true OR public.is_staff(auth.uid()));
CREATE POLICY "addons_staff_write" ON public.addons FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- discounts
CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type public.discount_type NOT NULL,
  value NUMERIC NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  minimum_booking_cents INTEGER,
  allowed_location_ids UUID[] NOT NULL DEFAULT '{}',
  allowed_space_ids UUID[] NOT NULL DEFAULT '{}',
  allowed_user_ids UUID[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated;
GRANT ALL ON public.discount_codes TO service_role;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "discounts_staff" ON public.discount_codes FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE DEFAULT ('MX-' || upper(substr(md5(random()::text),1,8))),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE RESTRICT,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  people INTEGER NOT NULL DEFAULT 1,
  rate_type public.rate_type NOT NULL DEFAULT 'hourly',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  addons_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  discount_code_id UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_time_valid CHECK (ends_at > starts_at)
);
ALTER TABLE public.bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (
    space_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status IN ('pending','confirmed','checked_in','completed'));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_read_own" ON public.bookings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()) OR (company_id IS NOT NULL AND company_id = public.current_company_id() AND public.has_role(auth.uid(),'company_admin')));
CREATE POLICY "bookings_insert_own" ON public.bookings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "bookings_update_own" ON public.bookings FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "bookings_staff_delete" ON public.bookings FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_bookings_space_time ON public.bookings (space_id, starts_at, ends_at);

CREATE TABLE public.booking_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES public.addons(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_addons TO authenticated;
GRANT ALL ON public.booking_addons TO service_role;
ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "booking_addons_rw" ON public.booking_addons FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_staff(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_staff(auth.uid()))));

-- payments and invoices
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.membership_subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'mock',
  provider_reference TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status public.payment_status NOT NULL DEFAULT 'pending',
  method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_read_own" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()) OR (company_id IS NOT NULL AND company_id = public.current_company_id() AND public.has_role(auth.uid(),'company_admin')));
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "payments_staff_write" ON public.payments FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE DEFAULT ('INV-' || to_char(now(),'YYYY') || '-' || upper(substr(md5(random()::text),1,6))),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'issued',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_read_own" ON public.invoices FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()) OR (company_id IS NOT NULL AND company_id = public.current_company_id() AND public.has_role(auth.uid(),'company_admin')));
CREATE POLICY "invoices_staff_write" ON public.invoices FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- access credentials
CREATE TABLE public.access_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'demo',
  method TEXT NOT NULL DEFAULT 'pin',
  credential_value TEXT,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_credentials TO authenticated;
GRANT ALL ON public.access_credentials TO service_role;
ALTER TABLE public.access_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_read_own" ON public.access_credentials FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "access_insert_own" ON public.access_credentials FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "access_staff_write" ON public.access_credentials FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, space_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_staff_read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ==================== DEMO DATA ====================
INSERT INTO public.locations (id, name, slug, description, address_line1, city, postal_code, country, latitude, longitude, parking_info, getting_there, opening_hours, access_hours, contact_email, contact_phone, amenities, active) VALUES
('11111111-1111-1111-1111-111111111111','MIXD.SPACE Garbsen','garbsen','Modernes, ca. 1.000 m² großes Bürohaus in Garbsen-Berenbostel für Desks, Private Offices, Team Offices, Meeting Rooms und Projektflächen.','Erlenweg 18','Garbsen-Berenbostel','30827','Deutschland',52.4267,9.5983,'Parken direkt am Gebäude auf dem großzügigen Grundstück.','Gut erreichbarer Standort in Garbsen mit schneller Anbindung in Richtung Hannover, A2, A352 und regionale Gewerbestandorte.','{"mon_fri":"08:00 – 20:00","sat":"09:00 – 16:00","sun":"Closed"}','{"members":"24/7 with digital access"}','garbsen@mixd.space','+49 5131 000000','["High-speed WiFi","Coffee & water","Parking","Printing","Phone booths","Kitchen","Lift access","Flexible units"]',true);

INSERT INTO public.amenities (name, slug, icon) VALUES
('High-speed WiFi','wifi','Wifi'),
('Monitor','monitor','Monitor'),
('Coffee included','coffee','Coffee'),
('Parking','parking','Car'),
('Whiteboard','whiteboard','PenLine'),
('Video conferencing','video','Video'),
('Standing desk','standing-desk','ArrowUpDown'),
('Natural light','natural-light','Sun');

INSERT INTO public.spaces (id, location_id, name, slug, space_type, description, capacity, size_sqm, floor, room_number, status, sort_order) VALUES
('21111111-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Flex Desk 01','flex-desk-01','flex_desk','An open desk in the shared workspace. Plug in and start.',1,NULL,'1','A1','active',1),
('21111111-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Flex Desk 02','flex-desk-02','flex_desk','An open desk in the shared workspace. Plug in and start.',1,NULL,'1','A2','active',2),
('21111111-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Flex Desk 03','flex-desk-03','flex_desk','An open desk in the shared workspace. Plug in and start.',1,NULL,'1','A3','active',3),
('21111111-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111','Private Office 01','private-office-01','private_office','A closed office for focused work, with a monitor and a door that shuts.',2,NULL,'1','B1','active',4),
('21111111-0000-0000-0000-000000000005','11111111-1111-1111-1111-111111111111','Private Office 02','private-office-02','private_office','A closed office for focused work, with a monitor and a door that shuts.',2,NULL,'1','B2','active',5),
('21111111-0000-0000-0000-000000000006','11111111-1111-1111-1111-111111111111','Meeting Room 01','meeting-room-01','meeting_room','A quiet room for meetings and workshops, with screen and whiteboard.',10,NULL,'2','C1','active',6),
('21111111-0000-0000-0000-000000000007','11111111-1111-1111-1111-111111111111','Team Office 01','team-office-01','team_office','A furnished office for a whole team, available by the day or month.',6,NULL,'2','D1','active',7);

INSERT INTO public.space_amenities (space_id, amenity_id)
SELECT s.id, a.id FROM public.spaces s CROSS JOIN public.amenities a
WHERE a.slug IN ('wifi','coffee','parking','natural-light');
INSERT INTO public.space_amenities (space_id, amenity_id)
SELECT s.id, a.id FROM public.spaces s CROSS JOIN public.amenities a
WHERE a.slug IN ('monitor') AND s.space_type IN ('private_office','team_office')
ON CONFLICT DO NOTHING;
INSERT INTO public.space_amenities (space_id, amenity_id)
SELECT s.id, a.id FROM public.spaces s CROSS JOIN public.amenities a
WHERE a.slug IN ('whiteboard','video') AND s.space_type = 'meeting_room'
ON CONFLICT DO NOTHING;

INSERT INTO public.pricing_rules (space_id, rate_type, price_cents) VALUES
('21111111-0000-0000-0000-000000000001','hourly',500),('21111111-0000-0000-0000-000000000001','daily',2400),
('21111111-0000-0000-0000-000000000002','hourly',500),('21111111-0000-0000-0000-000000000002','daily',2400),
('21111111-0000-0000-0000-000000000003','hourly',500),('21111111-0000-0000-0000-000000000003','daily',2400),
('21111111-0000-0000-0000-000000000004','hourly',1200),('21111111-0000-0000-0000-000000000004','daily',5900),
('21111111-0000-0000-0000-000000000005','hourly',1200),('21111111-0000-0000-0000-000000000005','daily',5900),
('21111111-0000-0000-0000-000000000006','hourly',2900),('21111111-0000-0000-0000-000000000006','daily',17900),
('21111111-0000-0000-0000-000000000007','daily',8900);

INSERT INTO public.availability_rules (location_id, weekday, opens_at, closes_at)
SELECT '11111111-1111-1111-1111-111111111111', d, '08:00', '20:00' FROM generate_series(1,5) d;
INSERT INTO public.availability_rules (location_id, weekday, opens_at, closes_at) VALUES
('11111111-1111-1111-1111-111111111111',6,'09:00','16:00');

INSERT INTO public.addons (location_id, name, description, price_cents, price_type) VALUES
('11111111-1111-1111-1111-111111111111','Parking space','Reserved parking directly at the building.',500,'per_day'),
('11111111-1111-1111-1111-111111111111','External monitor','27" monitor delivered to your desk.',700,'per_day'),
('11111111-1111-1111-1111-111111111111','Locker','A lockable locker for the duration of your booking.',300,'per_day'),
('11111111-1111-1111-1111-111111111111','Coffee package','Unlimited barista-style coffee.',400,'per_person'),
('11111111-1111-1111-1111-111111111111','Flipchart','Flipchart including paper and markers.',1500,'per_booking'),
('11111111-1111-1111-1111-111111111111','Meeting catering','Lunch, drinks and snacks for your meeting.',1900,'per_person');

INSERT INTO public.memberships (name, slug, description, monthly_price_cents, included_days, included_credits, discount_percent, allowed_space_types, highlights, sort_order) VALUES
('MIXD.FLEX','mixd-flex','Five coworking days a month, plus member rates everywhere else.',14900,5,0,10,'{flex_desk,meeting_room}','["5 coworking days","10% off meeting rooms","Member pricing"]',1),
('MIXD.UNLIMITED','mixd-unlimited','Unlimited access to flex desks under fair use.',29900,0,0,15,'{flex_desk,dedicated_desk,meeting_room}','["Unlimited flex desks","Fair use rules","15% off meeting rooms"]',2),
('MIXD.BUSINESS','mixd-business','Business address, mail service and workspace credits.',39900,0,10,20,'{flex_desk,private_office,meeting_room,team_office}','["Business address","Mail service","Workspace credits","Meeting credits"]',3);
