-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    resource TEXT NULL, -- e.g., 'user', 'admin', 'system'
    action TEXT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    created_by UUID NULL,
    updated_by UUID NULL,
    CONSTRAINT permissions_pkey PRIMARY KEY (id),
    CONSTRAINT permissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id),
    CONSTRAINT permissions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Create roles table (separate from profile role for flexibility)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT NULL,
    is_system_role BOOLEAN NOT NULL DEFAULT false, -- true for built-in roles like admin, user
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    created_by UUID NULL,
    updated_by UUID NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id),
    CONSTRAINT roles_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users (id)
) TABLESPACE pg_default;

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    granted_by UUID NULL,
    CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
    CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles (id) ON DELETE CASCADE,
    CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions (id) ON DELETE CASCADE,
    CONSTRAINT role_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users (id),
    CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_id)
) TABLESPACE pg_default;

-- Create user_roles junction table (for multiple roles per user)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    assigned_by UUID NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- for temporary role assignments
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles (id) ON DELETE CASCADE,
    CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users (id),
    CONSTRAINT user_roles_unique UNIQUE (user_id, role_id)
) TABLESPACE pg_default;

-- Create user_permissions table (for direct permission assignments)
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    granted_by UUID NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- for temporary permissions
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT user_permissions_pkey PRIMARY KEY (id),
    CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions (id) ON DELETE CASCADE,
    CONSTRAINT user_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users (id),
    CONSTRAINT user_permissions_unique UNIQUE (user_id, permission_id)
) TABLESPACE pg_default;

-- Enable Row Level Security
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for permissions table
CREATE POLICY "Admins can manage permissions" ON public.permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin' 
            AND profiles.status = 'active'
        )
    );

CREATE POLICY "Users can view permissions" ON public.permissions
    FOR SELECT USING (true); -- All authenticated users can view permissions

-- Create policies for roles table
CREATE POLICY "Admins can manage roles" ON public.roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin' 
            AND profiles.status = 'active'
        )
    );

CREATE POLICY "Users can view roles" ON public.roles
    FOR SELECT USING (true); -- All authenticated users can view roles

-- Create policies for role_permissions table
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin' 
            AND profiles.status = 'active'
        )
    );

CREATE POLICY "Users can view role permissions" ON public.role_permissions
    FOR SELECT USING (true);

-- Create policies for user_roles table
CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin' 
            AND profiles.status = 'active'
        )
    );

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

-- Create policies for user_permissions table
CREATE POLICY "Admins can manage user permissions" ON public.user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin' 
            AND profiles.status = 'active'
        )
    );

CREATE POLICY "Users can view their own permissions" ON public.user_permissions
    FOR SELECT USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions (category);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions (resource, action);
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles (name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON public.roles (is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions (role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions (permission_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles (role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON public.user_permissions (permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_active ON public.user_permissions (user_id, is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER on_permissions_updated
    BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_roles_updated
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert default permissions
INSERT INTO public.permissions (name, description, category, resource, action) VALUES
-- User Management
('user.create', 'Create new users', 'User Management', 'user', 'create'),
('user.read', 'View user information', 'User Management', 'user', 'read'),
('user.update', 'Update user information', 'User Management', 'user', 'update'),
('user.delete', 'Delete users', 'User Management', 'user', 'delete'),
('user.suspend', 'Suspend user accounts', 'User Management', 'user', 'suspend'),
('user.ban', 'Ban user accounts', 'User Management', 'user', 'ban'),

-- Administration
('admin.access', 'Access admin panel', 'Administration', 'admin', 'access'),
('system.manage', 'Manage system settings', 'Administration', 'system', 'manage'),
('roles.manage', 'Manage roles and permissions', 'Administration', 'roles', 'manage'),

-- Analytics & Reports
('reports.view', 'View reports', 'Analytics', 'reports', 'read'),
('reports.create', 'Create reports', 'Analytics', 'reports', 'create'),
('reports.export', 'Export reports', 'Analytics', 'reports', 'export'),
('analytics.view', 'View analytics dashboard', 'Analytics', 'analytics', 'read'),

-- Content Management
('content.create', 'Create content', 'Content', 'content', 'create'),
('content.read', 'View content', 'Content', 'content', 'read'),
('content.update', 'Update content', 'Content', 'content', 'update'),
('content.delete', 'Delete content', 'Content', 'content', 'delete'),
('content.moderate', 'Moderate content', 'Content', 'content', 'moderate'),

-- Profile Management
('profile.read', 'View own profile', 'Profile', 'profile', 'read'),
('profile.update', 'Update own profile', 'Profile', 'profile', 'update'),

-- E-commerce (example)
('products.manage', 'Manage products', 'E-commerce', 'products', 'manage'),
('orders.manage', 'Manage orders', 'E-commerce', 'orders', 'manage'),
('payments.manage', 'Manage payments', 'E-commerce', 'payments', 'manage')

ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
('admin', 'Administrator', 'Full system access with all permissions', true),
('moderator', 'Moderator', 'Content moderation and user management', true),
('user', 'User', 'Standard user with basic permissions', true),
('manager', 'Manager', 'Management level access', false),
('editor', 'Editor', 'Content editing permissions', false)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to default roles
-- Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Moderator permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'moderator' AND p.name IN (
    'user.read', 'user.update', 'user.suspend',
    'reports.view', 'analytics.view',
    'content.read', 'content.update', 'content.moderate',
    'profile.read', 'profile.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- User permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'user' AND p.name IN (
    'profile.read', 'profile.update',
    'content.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'manager' AND p.name IN (
    'user.read', 'user.update',
    'reports.view', 'reports.create', 'analytics.view',
    'content.read', 'content.update',
    'products.manage', 'orders.manage',
    'profile.read', 'profile.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Editor permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'editor' AND p.name IN (
    'content.create', 'content.read', 'content.update',
    'profile.read', 'profile.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;