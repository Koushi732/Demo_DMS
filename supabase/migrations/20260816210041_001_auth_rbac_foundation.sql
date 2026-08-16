-- Phase 2 Foundation: Authentication, Organization, RBAC

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ORGANIZATIONS (Tenant Isolation Boundary)
-- ============================================================
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_user_id UUID, -- References users(id), added later via ALTER
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, name)
);

-- ============================================================
-- 3. USERS (Extended Profile for Supabase Auth)
-- ============================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add circular reference constraint to departments
ALTER TABLE public.departments 
ADD CONSTRAINT fk_department_head 
FOREIGN KEY (head_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================================
-- 4. ROLES
-- ============================================================
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, name)
);

-- ============================================================
-- 5. PERMISSIONS
-- ============================================================
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 6. ROLE_PERMISSIONS
-- ============================================================
CREATE TABLE public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- 7. USER_ROLES
-- ============================================================
CREATE TABLE public.user_roles (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- MULTI-TENANCY RLS (ROW LEVEL SECURITY)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- Permissions table is global, no RLS needed (or accessible by all authenticated users)

-- Function to get current user's organization_id from JWT or public.users
CREATE OR REPLACE FUNCTION public.get_current_org_id() 
RETURNS UUID AS $$
BEGIN
  -- Attempt to get from JWT claims first (set via Supabase Auth custom claims)
  RETURN (current_setting('request.jwt.claims', true)::jsonb ->> 'organization_id')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fallback to database lookup if JWT doesn't have it (slower, but safe)
CREATE OR REPLACE FUNCTION public.get_user_org_id(user_uuid UUID) 
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id FROM public.users WHERE id = user_uuid;
  RETURN org_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 1. Organizations Policy
CREATE POLICY "Users can view their own organization"
    ON public.organizations
    FOR SELECT
    USING (id = COALESCE(public.get_current_org_id(), public.get_user_org_id(auth.uid())));

-- 2. Departments Policy
CREATE POLICY "Users can view departments in their organization"
    ON public.departments
    FOR ALL
    USING (organization_id = COALESCE(public.get_current_org_id(), public.get_user_org_id(auth.uid())));

-- 3. Users Policy
CREATE POLICY "Users can view users in their organization"
    ON public.users
    FOR ALL
    USING (organization_id = COALESCE(public.get_current_org_id(), public.get_user_org_id(auth.uid())));

-- 4. Roles Policy
CREATE POLICY "Users can view roles in their organization"
    ON public.roles
    FOR ALL
    USING (organization_id = COALESCE(public.get_current_org_id(), public.get_user_org_id(auth.uid())));

-- 5. Role Permissions Policy
CREATE POLICY "Users can view role permissions in their organization"
    ON public.role_permissions
    FOR SELECT
    USING (
        role_id IN (
            SELECT id FROM public.roles 
            WHERE organization_id = COALESCE(public.get_current_org_id(), public.get_user_org_id(auth.uid()))
        )
    );

-- 6. User Roles Policy
CREATE POLICY "Users can view user roles in their organization"
    ON public.user_roles
    FOR ALL
    USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE organization_id = COALESCE(public.get_current_org_id(), public.get_user_org_id(auth.uid()))
        )
    );

-- ============================================================
-- INITIAL SEED DATA (System Permissions)
-- ============================================================
INSERT INTO public.permissions (id, name, description, module) VALUES
    -- Documents
    (uuid_generate_v4(), 'DOCUMENT_VIEW', 'View documents', 'DOCUMENTS'),
    (uuid_generate_v4(), 'DOCUMENT_CREATE', 'Create/Upload documents', 'DOCUMENTS'),
    (uuid_generate_v4(), 'DOCUMENT_EDIT', 'Edit document metadata', 'DOCUMENTS'),
    (uuid_generate_v4(), 'DOCUMENT_DELETE', 'Delete documents', 'DOCUMENTS'),
    (uuid_generate_v4(), 'DOCUMENT_DOWNLOAD', 'Download document files', 'DOCUMENTS'),
    -- Workflows & Reviews
    (uuid_generate_v4(), 'DOCUMENT_SUBMIT', 'Submit documents for review', 'WORKFLOWS'),
    (uuid_generate_v4(), 'DOCUMENT_REVIEW', 'Review documents in workflow', 'WORKFLOWS'),
    (uuid_generate_v4(), 'DOCUMENT_APPROVE', 'Approve documents', 'WORKFLOWS'),
    (uuid_generate_v4(), 'DOCUMENT_REJECT', 'Reject documents', 'WORKFLOWS'),
    (uuid_generate_v4(), 'DOCUMENT_REQUEST_CHANGES', 'Request changes to documents', 'WORKFLOWS'),
    -- Versions
    (uuid_generate_v4(), 'DOCUMENT_VERSION_VIEW', 'View document version history', 'VERSIONS'),
    (uuid_generate_v4(), 'DOCUMENT_VERSION_CREATE', 'Create new document version', 'VERSIONS'),
    (uuid_generate_v4(), 'DOCUMENT_VERSION_RESTORE', 'Restore previous document version', 'VERSIONS'),
    -- Sharing
    (uuid_generate_v4(), 'DOCUMENT_SHARE', 'Share documents securely', 'SHARING'),
    -- Workflow Admin
    (uuid_generate_v4(), 'WORKFLOW_CREATE', 'Create workflow templates', 'WORKFLOW_ADMIN'),
    (uuid_generate_v4(), 'WORKFLOW_ASSIGN', 'Assign workflow steps', 'WORKFLOW_ADMIN'),
    -- Audit
    (uuid_generate_v4(), 'AUDIT_VIEW', 'View audit trail', 'AUDIT'),
    -- System Admin
    (uuid_generate_v4(), 'USER_CREATE', 'Create users', 'ADMIN'),
    (uuid_generate_v4(), 'USER_EDIT', 'Edit users', 'ADMIN'),
    (uuid_generate_v4(), 'USER_DEACTIVATE', 'Deactivate users', 'ADMIN'),
    (uuid_generate_v4(), 'ROLE_ASSIGN', 'Assign roles to users', 'ADMIN'),
    (uuid_generate_v4(), 'SYSTEM_CONFIGURE', 'Configure system settings', 'ADMIN')
ON CONFLICT (name) DO NOTHING;
