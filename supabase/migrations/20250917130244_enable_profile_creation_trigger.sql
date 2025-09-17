-- Enable automatic profile creation for production
-- This migration enables the auth trigger that creates a profile when a user signs up

-- Drop the trigger if it exists (safety measure)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create default profiles for any existing users who don't have profiles yet
INSERT INTO public.profiles (id, email, full_name)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;