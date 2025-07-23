-- SkillSwap Database Schema
-- PostgreSQL Schema for the SkillSwap Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
CREATE TYPE user_rank AS ENUM ('Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    avatar TEXT,
    bio TEXT,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    rank user_rank DEFAULT 'Novice',
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration >= 15), -- in minutes
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT, -- JSON array of tags
    level VARCHAR(50), -- Beginner, Intermediate, Advanced
    max_students INTEGER DEFAULT 1 CHECK (max_students >= 1),
    booking_count INTEGER DEFAULT 0 CHECK (booking_count >= 0),
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status booking_status DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    student_notes TEXT,
    teacher_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT booking_participants_different CHECK (student_id != teacher_id),
    CONSTRAINT booking_future_schedule CHECK (scheduled_at > created_at)
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT review_participants_different CHECK (reviewer_id != reviewee_id),
    -- Prevent duplicate reviews for the same booking
    CONSTRAINT unique_booking_review UNIQUE (reviewer_id, booking_id)
);

-- Indexes for performance
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_rank ON users(rank);
CREATE INDEX idx_users_rating ON users(rating DESC);

CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_location ON skills(location);
CREATE INDEX idx_skills_is_active ON skills(is_active);
CREATE INDEX idx_skills_price ON skills(price);
CREATE INDEX idx_skills_rating ON skills(rating DESC);
CREATE INDEX idx_skills_created_at ON skills(created_at DESC);

CREATE INDEX idx_bookings_skill_id ON bookings(skill_id);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_teacher_id ON bookings(teacher_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_public ON reviews(is_public);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user ratings when reviews change
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update reviewee's rating and review count
    UPDATE users SET 
        rating = COALESCE((
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM reviews 
            WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id) 
            AND is_public = TRUE 
            AND deleted_at IS NULL
        ), 0.0),
        review_count = COALESCE((
            SELECT COUNT(*) 
            FROM reviews 
            WHERE reviewee_id = COALESCE(NEW.reviewee_id, OLD.reviewee_id) 
            AND is_public = TRUE 
            AND deleted_at IS NULL
        ), 0)
    WHERE id = COALESCE(NEW.reviewee_id, OLD.reviewee_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for rating updates
CREATE TRIGGER trigger_update_user_rating_insert
    AFTER INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

CREATE TRIGGER trigger_update_user_rating_update
    AFTER UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

CREATE TRIGGER trigger_update_user_rating_delete
    AFTER DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Function to automatically update user rank based on points
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
    NEW.rank = CASE
        WHEN NEW.points >= 10000 THEN 'Master'::user_rank
        WHEN NEW.points >= 5000 THEN 'Expert'::user_rank
        WHEN NEW.points >= 2000 THEN 'Advanced'::user_rank
        WHEN NEW.points >= 500 THEN 'Intermediate'::user_rank
        WHEN NEW.points >= 100 THEN 'Beginner'::user_rank
        ELSE 'Novice'::user_rank
    END;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update rank when points change
CREATE TRIGGER trigger_update_user_rank
    BEFORE UPDATE OF points ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_rank();

CREATE TRIGGER trigger_set_initial_user_rank
    BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION update_user_rank();

-- Seed data for development
INSERT INTO users (auth0_id, username, email, full_name, location, bio, points, avatar) VALUES
('auth0|demo1', 'guitarjohn', 'john@example.com', 'John Smith', 'San Francisco, CA', 'Professional guitar instructor with 10+ years experience', 1250, NULL),
('auth0|demo2', 'webdev_sarah', 'sarah@example.com', 'Sarah Johnson', 'San Francisco, CA', 'Full-stack developer and coding mentor', 2800, NULL),
('auth0|demo3', 'photo_mike', 'mike@example.com', 'Mike Davis', 'San Francisco, CA', 'Professional photographer specializing in portraits', 850, NULL);

-- Get user IDs for foreign keys
DO $$
DECLARE
    john_id UUID;
    sarah_id UUID;
    mike_id UUID;
    guitar_skill_id UUID;
    webdev_skill_id UUID;
    photo_skill_id UUID;
    booking1_id UUID;
BEGIN
    SELECT id INTO john_id FROM users WHERE username = 'guitarjohn';
    SELECT id INTO sarah_id FROM users WHERE username = 'webdev_sarah';
    SELECT id INTO mike_id FROM users WHERE username = 'photo_mike';

    -- Insert skills
    INSERT INTO skills (id, title, description, category, user_id, price, duration, location, level, max_students) VALUES
    (uuid_generate_v4(), 'Guitar Lessons for Beginners', 'Learn to play guitar from basics to intermediate level. Perfect for complete beginners!', 'Music', john_id, 50.00, 60, 'San Francisco, CA', 'Beginner', 1),
    (uuid_generate_v4(), 'Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript basics. Build your first website!', 'Technology', sarah_id, 75.00, 90, 'San Francisco, CA', 'Beginner', 3),
    (uuid_generate_v4(), 'Photography Basics', 'Master the fundamentals of photography. Learn composition, lighting, and camera settings.', 'Arts', mike_id, 60.00, 120, 'San Francisco, CA', 'Beginner', 2);

    -- Get skill IDs
    SELECT id INTO guitar_skill_id FROM skills WHERE title = 'Guitar Lessons for Beginners';
    SELECT id INTO webdev_skill_id FROM skills WHERE title = 'Web Development Fundamentals';
    SELECT id INTO photo_skill_id FROM skills WHERE title = 'Photography Basics';

    -- Insert sample bookings
    INSERT INTO bookings (id, skill_id, student_id, teacher_id, scheduled_at, status, total_price, notes) VALUES 
    (uuid_generate_v4(), guitar_skill_id, sarah_id, john_id, CURRENT_TIMESTAMP + INTERVAL '7 days', 'confirmed', 50.00, 'Looking forward to learning guitar basics!'),
    (uuid_generate_v4(), webdev_skill_id, mike_id, sarah_id, CURRENT_TIMESTAMP + INTERVAL '5 days', 'pending', 75.00, 'Want to build my photography portfolio website'),
    (uuid_generate_v4(), photo_skill_id, john_id, mike_id, CURRENT_TIMESTAMP + INTERVAL '3 days', 'confirmed', 60.00, 'Need better photos for my music profile');

    -- Get booking ID for review
    SELECT id INTO booking1_id FROM bookings WHERE student_id = sarah_id AND teacher_id = john_id;

    -- Insert sample reviews
    INSERT INTO reviews (reviewer_id, reviewee_id, booking_id, rating, comment, is_public) VALUES
    (sarah_id, john_id, booking1_id, 5, 'John is an excellent guitar teacher! Very patient and explains concepts clearly. Highly recommend!', TRUE),
    (mike_id, sarah_id, NULL, 4, 'Sarah helped me understand web development basics. Great teaching style and very knowledgeable.', TRUE),
    (john_id, mike_id, NULL, 5, 'Mike took amazing photos for my album cover. Professional quality and great to work with!', TRUE);
END $$;

-- Views for common queries
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.full_name,
    u.points,
    u.rank,
    u.rating,
    u.review_count,
    COUNT(DISTINCT s.id) as skills_offered,
    COUNT(DISTINCT b_teacher.id) as bookings_as_teacher,
    COUNT(DISTINCT b_student.id) as bookings_as_student,
    COALESCE(SUM(CASE WHEN b_teacher.status = 'completed' THEN b_teacher.total_price ELSE 0 END), 0) as total_earnings
FROM users u
LEFT JOIN skills s ON u.id = s.user_id AND s.deleted_at IS NULL
LEFT JOIN bookings b_teacher ON u.id = b_teacher.teacher_id AND b_teacher.deleted_at IS NULL
LEFT JOIN bookings b_student ON u.id = b_student.student_id AND b_student.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.full_name, u.points, u.rank, u.rating, u.review_count;

-- View for skill search
CREATE VIEW skill_search AS
SELECT 
    s.*,
    u.full_name as teacher_name,
    u.username as teacher_username,
    u.rating as teacher_rating,
    u.review_count as teacher_review_count
FROM skills s
JOIN users u ON s.user_id = u.id
WHERE s.deleted_at IS NULL 
AND u.deleted_at IS NULL
AND s.is_active = TRUE;

-- Comments on tables
COMMENT ON TABLE users IS 'User accounts with Auth0 integration, points, and ranking system';
COMMENT ON TABLE skills IS 'Skills offered by users for teaching/sharing';
COMMENT ON TABLE bookings IS 'Booking sessions between students and teachers';
COMMENT ON TABLE reviews IS 'User reviews and ratings with 1-5 star system';

COMMENT ON COLUMN users.auth0_id IS 'Auth0 user identifier for authentication';
COMMENT ON COLUMN users.points IS 'User points for ranking system';
COMMENT ON COLUMN users.rank IS 'Calculated rank based on points (Novice to Master)';
COMMENT ON COLUMN skills.duration IS 'Session duration in minutes';
COMMENT ON COLUMN skills.max_students IS 'Maximum students per session';
COMMENT ON COLUMN bookings.total_price IS 'Total price for the booking session';
COMMENT ON COLUMN reviews.rating IS 'Star rating from 1-5';

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO skillswap_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO skillswap_user;

ANALYZE;