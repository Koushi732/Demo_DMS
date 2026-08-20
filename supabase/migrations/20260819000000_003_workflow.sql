-- Create enums
CREATE TYPE workflow_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE workflow_step_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Workflow Templates
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Workflow Template Steps
CREATE TABLE workflow_template_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    role_required VARCHAR(255)
);

-- Workflow Instances
CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,
    started_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status workflow_status DEFAULT 'IN_PROGRESS'::workflow_status NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Workflow Step Instances
CREATE TABLE workflow_step_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status workflow_step_status DEFAULT 'PENDING'::workflow_step_status NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add updated_at trigger for tables with updated_at column
CREATE TRIGGER trigger_update_workflow_templates_modtime
BEFORE UPDATE ON workflow_templates
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER trigger_update_workflow_instances_modtime
BEFORE UPDATE ON workflow_instances
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER trigger_update_workflow_step_instances_modtime
BEFORE UPDATE ON workflow_step_instances
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Enable Row Level Security (RLS)
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_instances ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Everyone in organization can read, only assigned users or admins can write)
-- This is a simplified RLS for Phase 4 demo purposes
CREATE POLICY "Users can view templates in their organization"
ON workflow_templates FOR SELECT
USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view workflow instances for their documents"
ON workflow_instances FOR SELECT
USING (EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = workflow_instances.document_id 
    AND d.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
));

CREATE POLICY "Users can view workflow steps in their organization"
ON workflow_step_instances FOR SELECT
USING (EXISTS (
    SELECT 1 FROM workflow_instances wi
    JOIN documents d ON wi.document_id = d.id
    WHERE wi.id = workflow_step_instances.workflow_instance_id
    AND d.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
));

CREATE POLICY "Users can update their assigned steps"
ON workflow_step_instances FOR UPDATE
USING (assigned_to_id = auth.uid());
