-- ==============================================================================
-- KEEDOHUB BRAND & ARTIST OS — POSTGRESQL / SUPABASE PRODUCTION DATABASE SCHEMA
-- Workspace Ownership and Membership as the Primary Security Boundary
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    system_role TEXT NOT NULL DEFAULT 'user' CHECK (system_role IN ('user', 'support', 'admin', 'super_admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
    default_workspace_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    identity_type TEXT NOT NULL CHECK (identity_type IN ('artist', 'brand')),
    bio TEXT,
    genre_or_niche TEXT,
    stage TEXT DEFAULT 'developing',
    primary_goal TEXT,
    target_audience TEXT,
    positioning TEXT,
    platforms JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add circular foreign key for default_workspace_id on users
ALTER TABLE users ADD CONSTRAINT fk_user_default_workspace 
    FOREIGN KEY (default_workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;

-- 3. WORKSPACE MEMBERS (Primary Security Boundary)
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'collaborator')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workspace_user UNIQUE (workspace_id, user_id)
);

-- 4. ARTIST DNA (Core context layer for Artist Operating Environment)
CREATE TABLE IF NOT EXISTS artist_dna (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    artist_identity TEXT,
    story TEXT,
    genre TEXT,
    sound_description TEXT,
    audience_demographics TEXT,
    voice_and_language TEXT,
    visual_direction TEXT,
    content_pillars JSONB DEFAULT '[]'::jsonb,
    recurring_themes JSONB DEFAULT '[]'::jsonb,
    goals TEXT,
    positioning TEXT,
    platforms JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    things_to_avoid JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BRAND DNA (Core context layer for Brand Operating Environment)
CREATE TABLE IF NOT EXISTS brand_dna (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    identity TEXT,
    positioning TEXT,
    business_category TEXT,
    audience TEXT,
    value_proposition TEXT,
    offers JSONB DEFAULT '[]'::jsonb,
    voice TEXT,
    visual_identity TEXT,
    competitive_positioning TEXT,
    content_pillars JSONB DEFAULT '[]'::jsonb,
    growth_goals JSONB DEFAULT '[]'::jsonb,
    business_model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RELEASES (Artist Operating Environment)
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('single', 'ep', 'album')),
    stage TEXT NOT NULL DEFAULT 'Idea' CHECK (stage IN ('Idea', 'Production', 'Preparation', 'Launch', 'Post-Release')),
    status TEXT NOT NULL DEFAULT 'in_progress',
    target_date DATE,
    genre TEXT,
    upc TEXT,
    isrc TEXT,
    label TEXT,
    distributor TEXT,
    dsp_pitch JSONB DEFAULT '{}'::jsonb,
    presave JSONB DEFAULT '{}'::jsonb,
    lyrics JSONB DEFAULT '{}'::jsonb,
    splits JSONB DEFAULT '[]'::jsonb,
    epk JSONB DEFAULT '{}'::jsonb,
    launch_checklist JSONB DEFAULT '[]'::jsonb,
    cover_asset_id UUID,
    master_asset_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CAMPAIGNS (Brand Operating Environment Growth Engine)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    target_audience TEXT,
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
    start_date DATE,
    end_date DATE,
    budget NUMERIC(12, 2) DEFAULT 0.00,
    offers JSONB DEFAULT '[]'::jsonb,
    readiness_score INT DEFAULT 0,
    strategy_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    category TEXT,
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CONTENT PILLARS
CREATE TABLE IF NOT EXISTS content_pillars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    target_percentage INT DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CONTENT ITEMS
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    pillar_id UUID REFERENCES content_pillars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    format TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'in_production', 'ready', 'scheduled', 'published')),
    scheduled_date TIMESTAMPTZ,
    caption TEXT,
    hook TEXT,
    call_to_action TEXT,
    media_url TEXT,
    content_tier TEXT DEFAULT 'pre_launch',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ASSETS
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    url TEXT NOT NULL,
    folder_path TEXT DEFAULT '/',
    tags JSONB DEFAULT '[]'::jsonb,
    is_master BOOLEAN DEFAULT FALSE,
    is_artwork BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. MILESTONES
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. PRODUCTS & SERVICES
CREATE TABLE IF NOT EXISTS products_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('product', 'service', 'subscription', 'package')),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    billing_period TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. BUSINESS DOCUMENTS
CREATE TABLE IF NOT EXISTS business_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('proposal', 'quotation', 'contract', 'company_letter', 'brief', 'agreement')),
    recipient_name TEXT,
    recipient_company TEXT,
    recipient_email TEXT,
    content_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. APPROVALS
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('release', 'campaign', 'document', 'asset', 'split', 'invoice')),
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 18. CREATIVE MEMORY (Contextual intelligence store)
CREATE TABLE IF NOT EXISTS creative_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    memory_key TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('voice', 'strategy', 'audience', 'sound', 'asset_reference', 'rule')),
    content TEXT NOT NULL,
    importance INT DEFAULT 1,
    source TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    target_name TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'action_required')),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE WORKSPACE ISOLATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_releases_ws ON releases(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_ws ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_ws ON content_items(workspace_id);
CREATE INDEX IF NOT EXISTS idx_assets_ws ON assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_ws ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invoices_ws ON invoices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_docs_ws ON business_documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_memory_ws ON creative_memory(workspace_id);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Primary Security Boundary: Workspace Membership & Ownership
-- ==============================================================================

-- Helper function to check if current Supabase auth user is a member of workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id AND user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM workspaces
        WHERE id = ws_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on core entities
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Workspaces Policy: Members can view, owners can update/delete
CREATE POLICY rls_workspaces_select ON workspaces
    FOR SELECT USING (is_workspace_member(id));

CREATE POLICY rls_workspaces_modify ON workspaces
    FOR ALL USING (owner_id = auth.uid());

-- Workspace Members Policy
CREATE POLICY rls_workspace_members ON workspace_members
    FOR ALL USING (is_workspace_member(workspace_id));

-- Artist DNA Policy
CREATE POLICY rls_artist_dna ON artist_dna
    FOR ALL USING (is_workspace_member(workspace_id));

-- Brand DNA Policy
CREATE POLICY rls_brand_dna ON brand_dna
    FOR ALL USING (is_workspace_member(workspace_id));

-- Releases Policy
CREATE POLICY rls_releases ON releases
    FOR ALL USING (is_workspace_member(workspace_id));

-- Campaigns Policy
CREATE POLICY rls_campaigns ON campaigns
    FOR ALL USING (is_workspace_member(workspace_id));

-- Content Items Policy
CREATE POLICY rls_content ON content_items
    FOR ALL USING (is_workspace_member(workspace_id));

-- Assets Policy
CREATE POLICY rls_assets ON assets
    FOR ALL USING (is_workspace_member(workspace_id));

-- Tasks Policy
CREATE POLICY rls_tasks ON tasks
    FOR ALL USING (is_workspace_member(workspace_id));

-- Products/Services Policy
CREATE POLICY rls_products ON products_services
    FOR ALL USING (is_workspace_member(workspace_id));

-- Business Documents Policy
CREATE POLICY rls_documents ON business_documents
    FOR ALL USING (is_workspace_member(workspace_id));

-- Invoices Policy
CREATE POLICY rls_invoices ON invoices
    FOR ALL USING (is_workspace_member(workspace_id));

-- Creative Memory Policy
CREATE POLICY rls_memory ON creative_memory
    FOR ALL USING (is_workspace_member(workspace_id));
