-- Note: All required columns (role, status, last_login_at, login_count, suspended_until, 
-- suspension_reason, created_by, updated_by) are already defined in migration 001

-- Create admin logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Admin logs policies
CREATE POLICY "Only admins can view admin logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can insert admin logs" ON public.admin_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_status TEXT;
BEGIN
    -- Get user role and status directly without using policies
    SELECT role, status INTO user_role, user_status
    FROM public.profiles 
    WHERE user_id = auth.uid();
    
    RETURN user_role = 'admin' AND user_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies without recursion
CREATE POLICY "Users can view own profile or admins can view all" ON public.profiles
    FOR SELECT USING (
        auth.uid() = user_id OR public.is_admin_user()
    );

CREATE POLICY "Users can update own profile or admins can update all" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = user_id OR public.is_admin_user()
    );

CREATE POLICY "Users can insert their own profile or admins can insert any" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR public.is_admin_user()
    );

CREATE POLICY "Admins can delete any profile" ON public.profiles
    FOR DELETE USING (public.is_admin_user());

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    action_type TEXT,
    target_user UUID DEFAULT NULL,
    action_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.admin_logs (admin_id, action, target_user_id, details)
    VALUES (auth.uid(), action_type, target_user, action_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update login tracking
CREATE OR REPLACE FUNCTION public.update_login_tracking()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        last_login_at = NOW(),
        login_count = COALESCE(login_count, 0) + 1
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to track logins
CREATE TRIGGER on_user_login
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW 
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.update_login_tracking();

-- Create user statistics function (accessible only by admins)
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS TABLE (
    date DATE,
    new_users BIGINT,
    active_users BIGINT,
    suspended_users BIGINT,
    banned_users BIGINT
) AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_admin_user() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT 
        DATE_TRUNC('day', created_at)::DATE as date,
        COUNT(*) as new_users,
        COUNT(*) FILTER (WHERE status = 'active') as active_users,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
        COUNT(*) FILTER (WHERE status = 'banned') as banned_users
    FROM public.profiles
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to suspend user
CREATE OR REPLACE FUNCTION public.suspend_user(
    target_user_id UUID,
    suspend_until TIMESTAMP WITH TIME ZONE,
    reason TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Update user status
    UPDATE public.profiles 
    SET 
        status = 'suspended',
        suspended_until = suspend_until,
        suspension_reason = reason,
        updated_by = auth.uid(),
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- Log the action
    PERFORM public.log_admin_action(
        'suspend_user',
        target_user_id,
        jsonb_build_object(
            'suspended_until', suspend_until,
            'reason', reason
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unsuspend user
CREATE OR REPLACE FUNCTION public.unsuspend_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Update user status
    UPDATE public.profiles 
    SET 
        status = 'active',
        suspended_until = NULL,
        suspension_reason = NULL,
        updated_by = auth.uid(),
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- Log the action
    PERFORM public.log_admin_action('unsuspend_user', target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;