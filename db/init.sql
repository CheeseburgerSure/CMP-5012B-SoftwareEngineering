CREATE TABLE IF NOT EXISTS "Users" (
    Email VARCHAR(100) PRIMARY KEY,
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

-- Insert users
INSERT INTO "Users" (
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
    'parkflow113@gmail.com', 
    'Parkflow', 
    'Admin', 
    '+1', 
    '1234567890', 
    '$2b$10$dc6rNGYRl4pyE3L49Eratuszs0Sc.fGZ.sv.TtgQVJ1vHbcIMl7lC',  -- Use the hashed password
    'admin_verification_code',  -- Optional: You can generate a random verification code or leave it as is
    TRUE,  -- Verified as true
    NOW() + INTERVAL '1 hour',  -- Verification code expires in 1 hour
    NOW(),  -- Created at the current time
    TRUE,  -- Is Admin set to true
    FALSE,  -- Not banned
    'XYZ987654',  -- Dummy license number (replace if needed)
    100.00  -- Starting balance
),
(
    'itsleihl@gmail.com',  -- Replace with the new user's email
    'Leihl',                 -- First Name
    'Zambrano',              -- Last Name
    '+44',                   -- Country Code
    '9876543210',           -- Phone Number
    '$2b$12$cE26VdAa8d/LL2MY6oxgsOhTKyrkbeudYaJ4oQwAi0RhlUPy8G71K',  -- Use the bcrypt-hashed password
    '123456',  -- A generated or static verification code
    FALSE,                  -- Set to false initially (user not verified yet)
    NOW() + INTERVAL '1 hour',  -- Verification code expires in 1 hour
    NOW(),                  -- Account creation time
    FALSE,                  -- Non-admin user
    FALSE,                  -- User is not banned
    'XYZ123456',            -- License Number (if needed)
    50.00                   -- Initial balance
);
