-- CUBERBOX Pro - Neural Schema V3.6
-- Optimizado para PostgreSQL 16 y análisis de IA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tablas Maestras
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    campaign_type VARCHAR(20) DEFAULT 'OUTBOUND', -- INBOUND, OUTBOUND, BLENDED, SURVEY
    dial_method VARCHAR(20) DEFAULT 'RATIO', -- MANUAL, RATIO, PREDICTIVE
    auto_dial_level DECIMAL(3,1) DEFAULT 1.0,
    hopper_level INT DEFAULT 100,
    amd_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL, -- ADMIN, AGENT, MANAGER
    email VARCHAR(150) UNIQUE NOT NULL,
    extension VARCHAR(10) UNIQUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gestión de Leads y Resultados
CREATE TABLE IF NOT EXISTS lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    status VARCHAR(20) DEFAULT 'NEW',
    last_local_call_time TIMESTAMP WITH TIME ZONE,
    called_count INT DEFAULT 0
);

-- Telefonía y Auditoría
CREATE TABLE IF NOT EXISTS cdr (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    campaign_id UUID REFERENCES campaigns(id),
    lead_id UUID REFERENCES leads(id),
    source VARCHAR(20),
    destination VARCHAR(20),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    answer_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_sec INT,
    billsec_sec INT,
    disposition VARCHAR(50), -- SALE, NI, DNC, etc.
    recording_path TEXT,
    cost DECIMAL(10,4) DEFAULT 0.0000
);

-- Inteligencia Artificial y Logs de Bots
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    interaction_type VARCHAR(10), -- TEXT / VOICE
    sentiment_score DECIMAL(3,2), -- -1.0 a 1.0
    input_text TEXT,
    bot_response TEXT,
    tokens_used INT,
    latency_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices Críticos para Operaciones Masivas
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_cdr_start ON cdr(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_cdr_destination ON cdr(destination);
CREATE INDEX IF NOT EXISTS idx_ai_lead ON ai_interactions(lead_id);