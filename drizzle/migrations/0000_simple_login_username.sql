
-- Add username for simple login (sign in with email OR username + password)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL AND username <> '';

-- Store the username chosen at signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NULLIF(NEW.raw_user_meta_data->>'username', '')
  )
  ON CONFLICT (user_id) DO UPDATE
    SET username = COALESCE(public.profiles.username, NULLIF(NEW.raw_user_meta_data->>'username', '')),
        email = COALESCE(public.profiles.email, NEW.email);
  RETURN NEW;
END;
$$;

-- Resolve an email-or-username to the account email (used before sign-in, so anon may execute)
CREATE OR REPLACE FUNCTION public.resolve_login_identifier(identifier TEXT)
RETURNS TABLE (email TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email
  FROM public.profiles p
  WHERE p.email IS NOT NULL
    AND lower(identifier) IN (lower(p.email), lower(p.username))
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.resolve_login_identifier(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_login_identifier(TEXT) TO anon, authenticated;
