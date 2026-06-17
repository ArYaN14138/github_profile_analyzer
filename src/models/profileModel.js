const pool = require('../config/db');

const ProfileModel = {
  /**
   * Find a profile by username
   * @param {string} username - GitHub username
   * @returns {Promise<object|null>} The profile object or null
   */
  findByUsername: async (username) => {
    const query = 'SELECT * FROM github_profiles WHERE username = ?';
    const [rows] = await pool.execute(query, [username.toLowerCase().trim()]);
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Insert a new analyzed profile
   * @param {object} profileData - The analyzed profile data
   * @returns {Promise<object>} The inserted/saved database entry info
   */
  create: async (profileData) => {
    const query = `
      INSERT INTO github_profiles (
        username,
        name,
        bio,
        public_repos,
        followers,
        following,
        avatar_url,
        profile_url,
        account_created,
        account_age_days,
        follower_repo_ratio,
        popularity_score,
        is_popular
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      profileData.username.toLowerCase().trim(),
      profileData.name || null,
      profileData.bio || null,
      profileData.public_repos || 0,
      profileData.followers || 0,
      profileData.following || 0,
      profileData.avatar_url || null,
      profileData.profile_url || null,
      profileData.account_created, // Date object or MySQL DATETIME string
      profileData.account_age_days,
      profileData.follower_repo_ratio,
      profileData.popularity_score,
      profileData.is_popular
    ];

    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...profileData };
  },

  /**
   * Get all analyzed profiles
   * @returns {Promise<Array>} List of all profiles
   */
  findAll: async () => {
    const query = 'SELECT * FROM github_profiles ORDER BY created_at DESC';
    const [rows] = await pool.execute(query);
    return rows;
  }
};

module.exports = ProfileModel;
