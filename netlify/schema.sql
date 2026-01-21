-- WineStudy PostgreSQL Schema for Neon DB

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    preferred_language VARCHAR(10) DEFAULT 'pt',
    google_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    country_id VARCHAR(50) UNIQUE NOT NULL,
    name_pt VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    world_type VARCHAR(20) NOT NULL, -- old_world or new_world
    flag_emoji VARCHAR(10),
    description_pt TEXT,
    description_en TEXT,
    image_url TEXT
);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    region_id VARCHAR(100) UNIQUE NOT NULL,
    country_id VARCHAR(50) REFERENCES countries(country_id),
    name VARCHAR(255) NOT NULL,
    name_pt VARCHAR(255),
    name_en VARCHAR(255),
    description_pt TEXT,
    description_en TEXT,
    terroir JSONB DEFAULT '{}',
    climate JSONB DEFAULT '{}',
    appellations TEXT[],
    main_grapes TEXT[],
    key_grapes TEXT[],
    wine_styles TEXT[]
);

-- Grapes table
CREATE TABLE IF NOT EXISTS grapes (
    id SERIAL PRIMARY KEY,
    grape_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    grape_type VARCHAR(20) NOT NULL, -- white or red
    origin_country VARCHAR(100),
    description_pt TEXT,
    description_en TEXT,
    aroma_notes_pt TEXT[],
    aroma_notes_en TEXT[],
    flavor_notes_pt TEXT[],
    flavor_notes_en TEXT[],
    structure JSONB DEFAULT '{}',
    aging_potential VARCHAR(50),
    best_regions TEXT[],
    climate_preference VARCHAR(100),
    image_url TEXT
);

-- Aroma Tags table
CREATE TABLE IF NOT EXISTS aroma_tags (
    id SERIAL PRIMARY KEY,
    tag_id VARCHAR(100) UNIQUE NOT NULL,
    name_pt VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    emoji VARCHAR(10)
);

-- Tasting Notes table
CREATE TABLE IF NOT EXISTS tasting_notes (
    id SERIAL PRIMARY KEY,
    tasting_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(user_id),
    wine_name VARCHAR(255) NOT NULL,
    producer VARCHAR(255),
    vintage INTEGER,
    region TEXT,
    grape_ids TEXT[],
    region_id VARCHAR(100),
    appearance JSONB DEFAULT '{}',
    nose JSONB DEFAULT '{}',
    palate JSONB DEFAULT '{}',
    conclusion JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Tracks table
CREATE TABLE IF NOT EXISTS study_tracks (
    id SERIAL PRIMARY KEY,
    track_id VARCHAR(50) UNIQUE NOT NULL,
    level VARCHAR(20) NOT NULL, -- basic, intermediate, advanced
    title_pt VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    lessons_count INTEGER DEFAULT 0,
    image_url TEXT
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    lesson_id VARCHAR(100) UNIQUE NOT NULL,
    track_id VARCHAR(50) REFERENCES study_tracks(track_id),
    title_pt VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_pt TEXT,
    content_en TEXT,
    order_index INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 10
);

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    question_id VARCHAR(100) UNIQUE NOT NULL,
    track_id VARCHAR(50) REFERENCES study_tracks(track_id),
    question_pt TEXT NOT NULL,
    question_en TEXT NOT NULL,
    options_pt TEXT[],
    options_en TEXT[],
    correct_answer INTEGER NOT NULL,
    explanation_pt TEXT,
    explanation_en TEXT
);

-- User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE REFERENCES users(user_id),
    completed_lessons TEXT[] DEFAULT '{}',
    quiz_scores JSONB DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    total_tastings INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_activity_date DATE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_regions_country ON regions(country_id);
CREATE INDEX IF NOT EXISTS idx_grapes_type ON grapes(grape_type);
CREATE INDEX IF NOT EXISTS idx_tastings_user ON tasting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_track ON lessons(track_id);
CREATE INDEX IF NOT EXISTS idx_questions_track ON quiz_questions(track_id);
