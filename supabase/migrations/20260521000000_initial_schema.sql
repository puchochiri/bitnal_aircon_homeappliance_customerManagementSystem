-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  name        text,
  phone       text,
  country_code text NOT NULL DEFAULT 'KR',
  timezone    text NOT NULL DEFAULT 'Asia/Seoul',
  tier        text NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro','advertiser','admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users: own row only" ON public.users
  USING (id = auth.uid());

-- customers
CREATE TABLE public.customers (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  phone       text,
  email       text,
  address     text,
  memo        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.customers(user_id);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers: own rows" ON public.customers
  USING (user_id = auth.uid());

-- appliances
CREATE TABLE public.appliances (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  brand          text,
  model_name     text,
  appliance_type text NOT NULL,
  install_date   date,
  serial_number  text,
  memo           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.appliances(customer_id);
ALTER TABLE public.appliances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appliances: via customer owner" ON public.appliances
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = appliances.customer_id AND c.user_id = auth.uid()
    )
  );

-- work_logs
CREATE TABLE public.work_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  work_type   text NOT NULL,
  worked_at   date NOT NULL,
  memo        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.work_logs(user_id);
CREATE INDEX ON public.work_logs(customer_id);
CREATE INDEX ON public.work_logs(worked_at);
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_logs: own rows" ON public.work_logs
  USING (user_id = auth.uid());

-- work_log_appliances (1:m junction)
CREATE TABLE public.work_log_appliances (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_log_id  uuid NOT NULL REFERENCES public.work_logs(id) ON DELETE CASCADE,
  appliance_id uuid NOT NULL REFERENCES public.appliances(id) ON DELETE CASCADE,
  UNIQUE(work_log_id, appliance_id)
);

CREATE INDEX ON public.work_log_appliances(work_log_id);
ALTER TABLE public.work_log_appliances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_log_appliances: via work_log owner" ON public.work_log_appliances
  USING (
    EXISTS (
      SELECT 1 FROM public.work_logs w
      WHERE w.id = work_log_appliances.work_log_id AND w.user_id = auth.uid()
    )
  );

-- work_financials (1:m revenue/cost)
CREATE TABLE public.work_financials (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_log_id uuid NOT NULL REFERENCES public.work_logs(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('revenue', 'cost')),
  amount      numeric(12,2) NOT NULL DEFAULT 0,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.work_financials(work_log_id);
ALTER TABLE public.work_financials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_financials: via work_log owner" ON public.work_financials
  USING (
    EXISTS (
      SELECT 1 FROM public.work_logs w
      WHERE w.id = work_financials.work_log_id AND w.user_id = auth.uid()
    )
  );

-- work_photos
CREATE TABLE public.work_photos (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_log_id  uuid NOT NULL REFERENCES public.work_logs(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  taken_at     timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.work_photos(work_log_id);
ALTER TABLE public.work_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "work_photos: via work_log owner" ON public.work_photos
  USING (
    EXISTS (
      SELECT 1 FROM public.work_logs w
      WHERE w.id = work_photos.work_log_id AND w.user_id = auth.uid()
    )
  );

-- appointments
CREATE TABLE public.appointments (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id  uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  status       text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','completed','cancelled')),
  work_type    text,
  memo         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.appointments(user_id);
CREATE INDEX ON public.appointments(scheduled_at);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appointments: own rows" ON public.appointments
  USING (user_id = auth.uid());

-- user_points
CREATE TABLE public.user_points (
  user_id      uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_points integer NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_points: own row" ON public.user_points
  USING (user_id = auth.uid());

-- point_logs
CREATE TABLE public.point_logs (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  delta      integer NOT NULL,
  reason     text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.point_logs(user_id);
ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "point_logs: own rows" ON public.point_logs
  USING (user_id = auth.uid());
