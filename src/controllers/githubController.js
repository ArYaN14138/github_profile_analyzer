const Profile = require('../models/profileModel');
const githubService = require('../services/githubService');

// Regex for valid GitHub username: alphanumeric and single hyphens, 1-39 chars, no starting/ending hyphen
const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/**
 * Validate GitHub username parameter
 * @param {string} username 
 * @returns {boolean}
 */
const isValidUsername = (username) => {
  if (!username) return false;
  return GITHUB_USERNAME_REGEX.test(username);
};

const githubController = {
  /**
   * POST /api/github/analyze/:username
   * Fetch, analyze, and save GitHub profile
   */
  analyzeProfile: async (req, res, next) => {
    try {
      const { username } = req.params;

      // 1. Input Validation
      if (!username || !isValidUsername(username.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid GitHub username format. Usernames must be 1-39 characters, contain only alphanumeric characters or single hyphens, and cannot start or end with a hyphen.'
        });
      }

      const formattedUsername = username.trim().toLowerCase();

      // 2. Duplicate Username Protection
      const existingProfile = await Profile.findByUsername(formattedUsername);
      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: `Profile for username '${formattedUsername}' has already been analyzed and stored in the database.`
        });
      }

      // 3. Fetch from GitHub API and compute insights
      const analyzedData = await githubService.fetchAndAnalyzeProfile(formattedUsername);

      // 4. Save to Database
      const savedProfile = await Profile.create(analyzedData);

      // 5. Standardized Response
      return res.status(201).json({
        success: true,
        message: 'GitHub profile analyzed and saved successfully.',
        data: savedProfile
      });
    } catch (error) {
      if (error.message === 'GitHub user not found') {
        return res.status(404).json({
          success: false,
          message: `GitHub user '${req.params.username}' not found on GitHub.`
        });
      }
      // Pass other unexpected errors to the error handler middleware
      next(error);
    }
  },

  /**
   * GET /api/github/profiles
   * Get all analyzed profiles
   */
  getProfiles: async (req, res, next) => {
    try {
      const profiles = await Profile.findAll();
      return res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/github/profiles/:username
   * Get a single analyzed profile by username
   */
  getProfileByUsername: async (req, res, next) => {
    try {
      const { username } = req.params;

      if (!username || !isValidUsername(username.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid GitHub username format.'
        });
      }

      const formattedUsername = username.trim().toLowerCase();
      const profile = await Profile.findByUsername(formattedUsername);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: `Analyzed profile for username '${formattedUsername}' not found in the database.`
        });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = githubController;
