-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS "Users" (
    UserID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email VARCHAR(100),
    First_Name VARCHAR(100),
    Last_Name VARCHAR(100),
    Country_Code VARCHAR(10),
    Phone_Number VARCHAR(20),
    Password_Hash VARCHAR(255),
    Verification_Code VARCHAR(100),
    Verified BOOLEAN DEFAULT FALSE,
    Code_Expires_At TIMESTAMP,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Is_Admin BOOLEAN DEFAULT FALSE,
    Is_Banned BOOLEAN DEFAULT FALSE,
    License_Number VARCHAR(100),
    Balance DECIMAL(10, 2) DEFAULT 0.00
);

-- Booking Table
CREATE TABLE IF NOT EXISTS "Booking" (
    BookingID SERIAL PRIMARY KEY,
    UserID UUID,
    Location VARCHAR(255),
    Time_Booked_for TIME,
    Duration INTERVAL,
    Booking_Date DATE,
    Price DECIMAL(10, 2),
    Booking_Paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES "Users" (UserID)
);

-- Parking Location
CREATE TABLE IF NOT EXISTS "ParkingLot" (
    LocationID SERIAL PRIMARY KEY,
    Location VARCHAR(100),
    Parking_Spaces INTEGER,
    Occupied_Spaces INTEGER,
    Rate DECIMAL(10, 2)
);

-- Insert users
INSERT INTO "Users" (
    UserID,
    Email, 
    First_Name, 
    Last_Name, 
    Country_Code, 
    Phone_Number, 
    Password_Hash, 
    Verification_Code, 
    Verified, 
    Code_Expires_At, 
    Created_At, 
    Is_Admin, 
    Is_Banned, 
    License_Number, 
    Balance
)
VALUES
(
    uuid_generate_v4(),  -- Automatically generate a UUID
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
),
(
    uuid_generate_v4(),  -- Automatically generate a UUID
    'itsleihl@gmail.com',  
    'Leihl',                 
    'Zambrano',              
    '+44',                   
    '9876543210',           
    '$2b$12$cE26VdAa8d/LL2MY6oxgsOhTKyrkbeudYaJ4oQwAi0RhlUPy8G71K',  
    '123456',  
    FALSE,                  
    NOW() + INTERVAL '1 hour',  
    NOW(),                  
    FALSE,                  
    FALSE,                  
    'XYZ123456',            
    50.00                   
);

-- Insert parking lot data
INSERT INTO "ParkingLot" (LocationID, Location, Parking_Spaces, Occupied_Spaces, Rate)
VALUES
(1, 'UEA Main Car Park', 100, 0, 5.00);
