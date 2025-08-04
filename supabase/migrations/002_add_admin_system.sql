-- Add admin role to profiles table
ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Add user status for account management
ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending'));

-- Add admin metadata
ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN login_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN suspended_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN suspension_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN updated_by UUID REFERENCES auth.users(id);

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

-- Update profiles policies for admin access
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

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

-- Create user statistics view
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as new_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
    COUNT(*) FILTER (WHERE status = 'banned') as banned_users
FROM public.profiles
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to admin users
CREATE POLICY "Admins can view user statistics" ON public.user_statistics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

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