-- Add admin-related functions

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
        AND status = 'active'
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend a user
CREATE OR REPLACE FUNCTION public.suspend_user(
    target_user_id UUID,
    suspend_until TIMESTAMP WITH TIME ZONE,
    reason TEXT
)
RETURNS VOID AS $
BEGIN
    -- Check if current user is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    UPDATE public.profiles 
    SET 
        status = 'suspended',
        suspended_until = suspend_until,
        suspension_reason = reason,
        updated_by = auth.uid()
    WHERE user_id = target_user_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unsuspend a user
CREATE OR REPLACE FUNCTION public.unsuspend_user(target_user_id UUID)
RETURNS VOID AS $
BEGIN
    -- Check if current user is admin
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    UPDATE public.profiles 
    SET 
        status = 'active',
        suspended_until = NULL,
        suspension_reason = NULL,
        updated_by = auth.uid()
    WHERE user_id = target_user_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    action_type TEXT,
    target_user UUID DEFAULT NULL,
    action_details JSONB DEFAULT NULL
)
RETURNS VOID AS $
BEGIN
    INSERT INTO public.admin_logs (
        admin_id,
        action,
        target_user_id,
        details,
        created_at
    ) VALUES (
        auth.uid(),
        action_type,
        target_user,
        action_details,
        NOW()
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for admin functions
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
            AND p.status = 'active'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
            AND p.status = 'active'
        )
    );