CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users
CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(32)  NOT NULL DEFAULT 'athlete'
                        CHECK (role IN ('athlete','nutritionist','trainer')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- athlete_profiles
CREATE TABLE athlete_profiles (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    athlete_code    VARCHAR(64)   NOT NULL UNIQUE,
    sport_modality  VARCHAR(128),
    body_weight_kg  NUMERIC(5,2)  CHECK (body_weight_kg > 0),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- training_sessions
CREATE TABLE training_sessions (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id          UUID            NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,

    modality            VARCHAR(128)    NOT NULL,
    session_start       TIMESTAMPTZ     NOT NULL,
    session_end         TIMESTAMPTZ,
    intensity           VARCHAR(32)     CHECK (intensity IN ('low','moderate','high','maximal')),

    -- pré-sessão
    pre_weight_kg       NUMERIC(5,2)    CHECK (pre_weight_kg > 0),
    urine_color_pre     SMALLINT        CHECK (urine_color_pre BETWEEN 1 AND 8),
    bladder_emptied     BOOLEAN         NOT NULL DEFAULT FALSE,

    -- pós-sessão
    post_weight_kg      NUMERIC(5,2)    CHECK (post_weight_kg > 0),
    urine_volume_ml     NUMERIC(6,1)    CHECK (urine_volume_ml >= 0),  -- urina no período 
    clothing_soaked     BOOLEAN         NOT NULL DEFAULT FALSE,

    -- ambiente
    temperature_c       NUMERIC(4,1),
    humidity_pct        SMALLINT        CHECK (humidity_pct BETWEEN 0 AND 100),

    notes               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_end_after_start
        CHECK (session_end IS NULL OR session_end > session_start)
);

-- fluid_intake_logs  (registros de ingestão durante a sessão)
CREATE TABLE fluid_intake_logs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID         NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    volume_ml   NUMERIC(6,1) NOT NULL CHECK (volume_ml > 0),
    fluid_type  VARCHAR(32)  NOT NULL DEFAULT 'water'
                    CHECK (fluid_type IN ('water','isotonic','hypotonic','hypertonic','juice','other')),
    logged_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- session_results  
CREATE TABLE session_results (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID          NOT NULL UNIQUE REFERENCES training_sessions(id) ON DELETE CASCADE,

    -- cálculos
    total_intake_ml         NUMERIC(8,2)  NOT NULL DEFAULT 0,
    adjusted_weight_loss_kg NUMERIC(5,3),
    weight_loss_pct         NUMERIC(5,2),
    sweat_rate_lph          NUMERIC(5,3)  CHECK (sweat_rate_lph >= 0),
    fluid_balance_ml        NUMERIC(8,2),

    -- risco
    dehydration_risk        VARCHAR(16)   NOT NULL DEFAULT 'none'
                                CHECK (dehydration_risk IN ('none','low','moderate','high','critical')),

    -- recomendação
    target_intake_min_mlh   NUMERIC(7,1),
    target_intake_max_mlh   NUMERIC(7,1),
    interval_minutes        SMALLINT      CHECK (interval_minutes BETWEEN 1 AND 60),
    alert_dehydration       BOOLEAN       NOT NULL DEFAULT FALSE,
    alert_overhydration     BOOLEAN       NOT NULL DEFAULT FALSE,
    notes                   TEXT,

    calculated_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Índices essenciais
CREATE INDEX idx_sessions_athlete  ON training_sessions(athlete_id, session_start DESC);
CREATE INDEX idx_intake_session    ON fluid_intake_logs(session_id);