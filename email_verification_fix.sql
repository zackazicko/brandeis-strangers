-- First, make sure Row Level Security is enabled on the table
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anonymous users to insert verification codes
CREATE POLICY "Allow anonymous users to insert verification codes" 
ON public.email_verifications FOR INSERT TO anon WITH CHECK (true);

-- Create a policy that allows anonymous users to read verification codes
-- This is needed for the verification step
CREATE POLICY "Allow anonymous users to read verification codes" 
ON public.email_verifications FOR SELECT TO anon USING (true);

-- Grant insert and select permissions to anonymous users
GRANT INSERT, SELECT ON public.email_verifications TO anon;

-- Grant all permissions to authenticated users and service role (for admin operations)
GRANT ALL ON public.email_verifications TO authenticated;
GRANT ALL ON public.email_verifications TO service_role;

-- If the table doesn't exist at all, here's the full creation script:
-- Uncomment this section if the table doesn't exist

/*
-- Create the email_verifications table
CREATE TABLE IF NOT EXISTS public.email_verifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  verification_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes')
);

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON public.email_verifications(email);
*/ 