-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS "users" (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    country_code VARCHAR(10),
    phone_number VARCHAR(20),
    password_hash VARCHAR(255),
    verification_code VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    code_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    license_number VARCHAR(100),
    balance DECIMAL(10, 2) DEFAULT 0.00
);

-- Booking Table
CREATE TABLE IF NOT EXISTS "bookings" (
    booking_id SERIAL PRIMARY KEY,
    user_id UUID,
    location VARCHAR(255),
    time_booked_for TIME,
    duration INTERVAL,
    booking_date DATE,
    price DECIMAL(10, 2),
    booking_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES "users" (user_id)
);

-- Parking Location Table
CREATE TABLE IF NOT EXISTS "parking_lots" (
    location_id SERIAL PRIMARY KEY,
    location VARCHAR(100),
    parking_spaces INTEGER,
    occupied_spaces INTEGER,
    rate DECIMAL(10, 2)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS "transactions" (
    transaction_id SERIAL PRIMARY KEY,
    user_id UUID,
    amount DECIMAL(10, 2),
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "users" (user_id)
);

-- Email Verification Tokens Table
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    verification_token_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "users" (user_id) ON DELETE CASCADE
);

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    reset_token_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempts INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "users" (user_id) ON DELETE CASCADE
);

-- Password Reset Attempts Table
CREATE TABLE IF NOT EXISTS "password_reset_attempts" (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL, 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "users" (user_id)
);

-- Insert Users
INSERT INTO "users" (
    user_id,
    email, 
    first_name, 
    last_name, 
    country_code, 
    phone_number, 
    password_hash, 
    verification_code, 
    verified, 
    code_expires_at, 
    created_at, 
    is_admin, 
    is_banned, 
    license_number, 
    balance
)
VALUES
(
    uuid_generate_v4(),  
    'parkflow113@gmail.com', 
    'Parkflow', 
    'Admin', 
    '+1', 
    '1234567890', 
    '$2b$10$dc6rNGYRl4pyE3L49Eratuszs0Sc.fGZ.sv.TtgQVJ1vHbcIMl7lC', 
    'admin_verification_code',  
    TRUE,  
    NOW() + INTERVAL '1 hour',  
    NOW(),  
    TRUE,  
    FALSE,  
    'XYZ987654',  
    100.00  
);
-- (
--     uuid_generate_v4(),  
--     'itsleihl@gmail.com',  
--     'Leihl',                 
--     'Zambrano',              
--     '+44',                   
--     '9876543210',           
--     '$2b$12$cE26VdAa8d/LL2MY6oxgsOhTKyrkbeudYaJ4oQwAi0RhlUPy8G71K',  
--     '123456',  
--     FALSE,                  
--     NOW() + INTERVAL '1 hour',  
--     NOW(),                   
--     FALSE,                  
--     FALSE,                  
--     'XYZ123456',            
--     50.00                   
-- );

-- Insert parking lot data
INSERT INTO "parking_lots" (location_id, location, parking_spaces, occupied_spaces, rate)
VALUES
(1, 'UEA Main Car Park', 100, 0, 5.00),
(2, 'UEA Sports Park Car Park', 40, 0, 3.00);

