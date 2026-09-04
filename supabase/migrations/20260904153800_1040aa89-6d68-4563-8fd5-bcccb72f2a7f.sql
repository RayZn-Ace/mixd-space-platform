CREATE TABLE public.booking_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_splits TO authenticated;
GRANT ALL ON public.booking_splits TO service_role;

ALTER TABLE public.booking_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their booking splits"
ON public.booking_splits FOR ALL TO authenticated
USING (created_by = auth.uid() OR user_id = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE INDEX booking_splits_booking_idx ON public.booking_splits(booking_id);

CREATE TRIGGER update_booking_splits_updated_at
BEFORE UPDATE ON public.booking_splits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();