-- Phase 3: Core DMS
-- Document Types, Folders, Documents, Versions, Metadata Schema

-- Storage Bucket Creation
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

CREATE POLICY "Users can upload documents to their org folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND (auth.uid() IN (SELECT id FROM public.users))
  );

CREATE POLICY "Users can read documents in their org"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND (auth.uid() IN (SELECT id FROM public.users))
  );

-- Document Types
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    prefix VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    metadata_schema JSONB DEFAULT '{}'::jsonb,
    default_review_period_days INTEGER DEFAULT 365,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Folders
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Status Enum
DROP TYPE IF EXISTS document_status CASCADE;
CREATE TYPE document_status AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'EFFECTIVE', 'OBSOLETE', 'ARCHIVED', 'SUPERSEDED');

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_number VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    document_type_id UUID REFERENCES public.document_types(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    
    classification VARCHAR(50),
    status document_status NOT NULL DEFAULT 'DRAFT',
    
    -- We will add current_version_id FK later when document_versions is created
    current_version_id UUID,
    
    effective_date DATE,
    review_period_days INTEGER,
    next_review_date DATE,
    superseded_by_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    
    tags TEXT[],
    processing_status VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (organization_id, document_number)
);

-- Document Versions
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    filename VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    checksum_sha256 VARCHAR(64),
    status document_status DEFAULT 'DRAFT',
    change_reason TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (document_id, version_number)
);

-- Add current_version_id foreign key back to documents table
ALTER TABLE public.documents
    ADD CONSTRAINT fk_documents_current_version
    FOREIGN KEY (current_version_id) REFERENCES public.document_versions(id) ON DELETE SET NULL;

-- Document Metadata
CREATE TABLE IF NOT EXISTS public.document_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    is_ai_generated BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(document_id, key)
);

-- Indexes
CREATE INDEX idx_documents_org ON public.documents(organization_id);
CREATE INDEX idx_documents_dept ON public.documents(department_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_folders_parent ON public.folders(parent_id);
CREATE INDEX idx_document_metadata_doc ON public.document_metadata(document_id);
CREATE INDEX idx_document_versions_doc ON public.document_versions(document_id);

-- Row Level Security
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_metadata ENABLE ROW LEVEL SECURITY;

-- Base RLS Policies
CREATE POLICY "Org Access: Document Types" ON public.document_types
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org Access: Folders" ON public.folders
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org Access: Documents" ON public.documents
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Org Access: Document Versions" ON public.document_versions
    FOR ALL USING (document_id IN (SELECT id FROM public.documents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid())));

CREATE POLICY "Org Access: Document Metadata" ON public.document_metadata
    FOR ALL USING (document_id IN (SELECT id FROM public.documents WHERE organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid())));
