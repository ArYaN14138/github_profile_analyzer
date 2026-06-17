const express = require('express');
const githubController = require('../controllers/githubController');

const router = express.Router();

// POST /api/github/analyze/:username - Analyze and save GitHub profile
router.post('/analyze/:username', githubController.analyzeProfile);

// GET /api/github/profiles - Retrieve all analyzed profiles
router.get('/profiles', githubController.getProfiles);

// GET /api/github/profiles/:username - Retrieve single profile by username
router.get('/profiles/:username', githubController.getProfileByUsername);

module.exports = router;
