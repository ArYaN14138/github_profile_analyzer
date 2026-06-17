-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS github_analyzer;

-- Use the database
USE github_analyzer;

-- Create github_profiles table
CREATE TABLE IF NOT EXISTS github_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NULL,
    bio TEXT NULL,
    public_repos INT NOT NULL DEFAULT 0,
    followers INT NOT NULL DEFAULT 0,
    following INT NOT NULL DEFAULT 0,
    avatar_url VARCHAR(255) NULL,
    profile_url VARCHAR(255) NULL,
    account_created DATETIME NOT NULL,
    account_age_days INT NOT NULL,
    follower_repo_ratio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    popularity_score INT NOT NULL DEFAULT 0,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
