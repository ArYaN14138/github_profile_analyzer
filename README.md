# GitHub Profile Analyzer API

A complete, production-ready backend application built with **Node.js**, **Express.js**, and **MySQL** that integrates with the GitHub Public API to analyze user profiles, calculate custom insights, and store them securely in a database.

---

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MySQL (using `mysql2/promise` connection pooling)
*   **HTTP Client:** Axios
*   **Environment Management:** dotenv
*   **Architecture:** Clean Model-View-Controller (MVC)

---

## Database Schema (`github_analyzer`)

The application stores the analyzed profile data and insights in a MySQL table named `github_profiles` with the following schema:

*   `username` (VARCHAR, UNIQUE, NOT NULL): The GitHub login name in lowercase.
*   `name` (VARCHAR, NULL): The user's name.
*   `bio` (TEXT, NULL): The profile bio.
*   `public_repos` (INT): Number of public repositories.
*   `followers` (INT): Number of followers.
*   `following` (INT): Number of users followed.
*   `avatar_url` (VARCHAR, NULL): URL of the user's avatar.
*   `profile_url` (VARCHAR, NULL): URL of the user's GitHub profile.
*   `account_created` (DATETIME): Date the user account was created on GitHub.
*   `account_age_days` (INT): Calculated age of the account in days.
*   `follower_repo_ratio` (DECIMAL): Calculated ratio of followers to public repositories.
*   `popularity_score` (INT): Calculated popularity score.
*   `is_popular` (BOOLEAN): Boolean indicating if the user has more than 100 followers.
*   `created_at` (TIMESTAMP): Record insertion timestamp.

---

## Calculations & Insights

1.  **Account Age (Days):** `current date` - `account creation date` (on GitHub).
2.  **Follower to Repo Ratio:** `followers` / `public_repos` (handles `0` public repos safely).
3.  **Popularity Score:** `followers` + (`public_repos` * 2).
4.  **Is Popular:** `true` if `followers` > 100, otherwise `false`.

---

## Additional Features

*   **Input Validation:** Validates GitHub username formats (length, characters, and hyphen placements) using standard GitHub username rules before executing requests.
*   **Duplicate Username Protection:** Prevents multiple database entries for the same GitHub username. Returns a clear `409 Conflict` response if the user has already been analyzed.
*   **API Response Standardization:** Consistent JSON structure for all success and error responses.
*   **Health Check Endpoint:** `/health` checks server uptime and verifies database connection health dynamically.
*   **Error Handling Middleware:** Global middleware captures all database connection issues, validation errors, and invalid path inputs.

---

## Directory Structure

```
github-profile-analyzer/
├── src/
│   ├── config/
│   │   └── db.js              # MySQL Connection Pool
│   ├── controllers/
│   │   └── githubController.js # Route Handlers & Input Validation
│   ├── services/
│   │   └── githubService.js   # GitHub API Integration & Calculations
│   ├── models/
│   │   └── profileModel.js    # Database SQL Queries
│   ├── routes/
│   │   └── githubRoutes.js    # Express Route Mapping
│   └── app.js                 # App Startup and Middleware Configuration
├── .env                       # Local Environment variables
├── .env.example               # Example Configuration file
├── schema.sql                 # Database Schema definitions
├── GitHub_Profile_Analyzer_API.postman_collection.json # Postman Collection
├── package.json
└── README.md
```

---

## Setup & Running Instructions

### 1. Prerequisites
Ensure you have **Node.js** and **MySQL** server installed and running on your system.

### 2. Database Setup
Create the MySQL database and the tables by executing the `schema.sql` file. You can run this in your MySQL CLI or any database client:
```sql
SOURCE /path/to/project/schema.sql;
```
Or in the terminal:
```bash
mysql -u root -p < schema.sql
```

### 3. Environment Setup
Copy the configuration template to create a `.env` file:
```bash
cp .env.example .env
```
Fill in the `.env` file with your MySQL details:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=github_analyzer

# Optional: GITHUB_TOKEN to raise rate limits (60/hr -> 5000/hr)
GITHUB_TOKEN=your_personal_access_token
```

### 4. Install Dependencies
Install the required node modules:
```bash
npm install
```

### 5. Running the Application
*   **For Development (with hot-reloading using nodemon):**
    ```bash
    npm run dev
    ```
*   **For Production:**
    ```bash
    npm start
    ```

---

## API Endpoints

### 1. Base Endpoint
*   **URL:** `GET /`
*   **Response:**
    ```json
    {
      "success": true,
      "message": "Welcome to the GitHub Profile Analyzer API",
      "version": "1.0.0",
      "documentation": "See README.md for endpoint specifications"
    }
    ```

### 2. Health Check
*   **URL:** `GET /health`
*   **Response (Success):**
    ```json
    {
      "success": true,
      "status": "UP",
      "timestamp": "2026-06-17T11:45:00.000Z",
      "uptime": 12.34,
      "database": "Connected"
    }
    ```

### 3. Analyze & Save Profile
*   **URL:** `POST /api/github/analyze/:username`
*   **Method:** `POST`
*   **Response (Success - 201 Created):**
    ```json
    {
      "success": true,
      "message": "GitHub profile analyzed and saved successfully.",
      "data": {
        "id": 1,
        "username": "octocat",
        "name": "The Octocat",
        "bio": "Testing github api",
        "public_repos": 8,
        "followers": 1500,
        "following": 9,
        "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
        "profile_url": "https://github.com/octocat",
        "account_created": "2011-01-25T18:44:36.000Z",
        "account_age_days": 5622,
        "follower_repo_ratio": 187.5,
        "popularity_score": 1516,
        "is_popular": true
      }
    }
    ```
*   **Response (Duplicate Error - 409 Conflict):**
    ```json
    {
      "success": false,
      "message": "Profile for username 'octocat' has already been analyzed and stored in the database."
    }
    ```

### 4. Get All Analyzed Profiles
*   **URL:** `GET /api/github/profiles`
*   **Method:** `GET`
*   **Response (Success - 200 OK):**
    ```json
    {
      "success": true,
      "count": 1,
      "data": [
        {
          "id": 1,
          "username": "octocat",
          "name": "The Octocat",
          "bio": "Testing github api",
          "public_repos": 8,
          "followers": 1500,
          "following": 9,
          "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
          "profile_url": "https://github.com/octocat",
          "account_created": "2011-01-25T18:44:36.000Z",
          "account_age_days": 5622,
          "follower_repo_ratio": "187.50",
          "popularity_score": 1516,
          "is_popular": 1,
          "created_at": "2026-06-17T11:45:10.000Z"
        }
      ]
    }
    ```

### 5. Get Single Profile
*   **URL:** `GET /api/github/profiles/:username`
*   **Method:** `GET`
*   **Response (Success - 200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": 1,
        "username": "octocat",
        "name": "The Octocat",
        "bio": "Testing github api",
        "public_repos": 8,
        "followers": 1500,
        "following": 9,
        "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
        "profile_url": "https://github.com/octocat",
        "account_created": "2011-01-25T18:44:36.000Z",
        "account_age_days": 5622,
        "follower_repo_ratio": "187.50",
        "popularity_score": 1516,
        "is_popular": 1,
        "created_at": "2026-06-17T11:45:10.000Z"
      }
    }
    ```

---

## Postman Collection

This repository contains a pre-configured Postman collection JSON file to help you test the endpoints:
*   [GitHub_Profile_Analyzer_API.postman_collection.json](file:///Users/aryanvishwakarma/github-profile-analyzer/GitHub_Profile_Analyzer_API.postman_collection.json)

### How to Import and Use:
1. Open the **Postman** application.
2. Click the **Import** button (usually located in the top-left area).
3. Drag and drop or select the `GitHub_Profile_Analyzer_API.postman_collection.json` file from this project's root folder.
4. Once imported, select the collection and go to the **Variables** tab to adjust the `BASE_URL` (defaults to `http://localhost:5000` for local testing, or you can change it to your live Render/Railway URL).
5. Send requests to test the API!

