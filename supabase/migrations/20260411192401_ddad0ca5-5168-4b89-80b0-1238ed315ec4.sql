
CREATE TABLE public.tour_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tour_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON public.tour_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Agents can view bookings for their properties" ON public.tour_bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties WHERE properties.id = tour_bookings.property_id AND properties.created_by = auth.uid())
  );

CREATE POLICY "Admins can view all bookings" ON public.tour_bookings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Approved users can create bookings" ON public.tour_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_approved(auth.uid()));

CREATE POLICY "Agents can update booking status" ON public.tour_bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.properties WHERE properties.id = tour_bookings.property_id AND properties.created_by = auth.uid())
  );
