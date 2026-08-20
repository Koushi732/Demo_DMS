-- Processing and Intelligence Architecture
-- Stage 2: Extracted Text and Processing Jobs

-- 1. Create document_processing_jobs table
CREATE TABLE IF NOT EXISTS public.document_processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_doc_processing_jobs_org ON public.document_processing_jobs(organization_id);
CREATE INDEX idx_doc_processing_jobs_version ON public.document_processing_jobs(document_version_id);
CREATE INDEX idx_doc_processing_jobs_status ON public.document_processing_jobs(status);

ALTER TABLE public.document_processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org Access: Processing Jobs" ON public.document_processing_jobs
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- 2. Create document_extracted_text table
CREATE TABLE IF NOT EXISTS public.document_extracted_text (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE UNIQUE,
    extracted_text TEXT,
    extraction_method VARCHAR(50),
    search_vector TSVECTOR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_doc_extracted_text_org ON public.document_extracted_text(organization_id);
CREATE INDEX idx_doc_extracted_text_search ON public.document_extracted_text USING GIN (search_vector);

ALTER TABLE public.document_extracted_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org Access: Extracted Text" ON public.document_extracted_text
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- 3. Search Vector trigger
CREATE OR REPLACE FUNCTION update_document_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', coalesce(NEW.extracted_text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_search_vector
BEFORE INSERT OR UPDATE OF extracted_text ON public.document_extracted_text
FOR EACH ROW
EXECUTE FUNCTION update_document_search_vector();
