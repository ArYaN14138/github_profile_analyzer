const axios = require('axios');

/**
 * Configure Axios client for GitHub API with optional auth token
 */
const getGithubClient = () => {
  const headers = {
    'User-Agent': 'github-profile-analyzer-api',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  return axios.create({
    baseURL: 'https://api.github.com',
    headers,
    timeout: 10000,
  });
};

const githubService = {
  /**
   * Fetch user profile from GitHub API and compute insights
   * @param {string} username - GitHub username
   * @returns {Promise<object>} The compiled profile data ready for database storage
   */
  fetchAndAnalyzeProfile: async (username) => {
    const client = getGithubClient();
    try {
      const response = await client.get(`/users/${username}`);
      const data = response.data;

      // Extract raw details
      const profile = {
        username: data.login.toLowerCase(),
        name: data.name || null,
        bio: data.bio || null,
        public_repos: data.public_repos || 0,
        followers: data.followers || 0,
        following: data.following || 0,
        avatar_url: data.avatar_url || null,
        profile_url: data.html_url || null,
        account_created: new Date(data.created_at),
      };

      // Calculate Insights:
      // 1. account_age_days = current date - account creation date
      const accountCreatedDate = new Date(profile.account_created);
      const currentDate = new Date();
      const timeDiffMs = currentDate.getTime() - accountCreatedDate.getTime();
      profile.account_age_days = Math.max(0, Math.floor(timeDiffMs / (1000 * 60 * 60 * 24)));

      // 2. follower_repo_ratio = followers / public_repos (handling division by zero)
      profile.follower_repo_ratio = profile.public_repos > 0 
        ? parseFloat((profile.followers / profile.public_repos).toFixed(2)) 
        : 0.00;

      // 3. popularity_score = followers + (public_repos * 2)
      profile.popularity_score = profile.followers + (profile.public_repos * 2);

      // 4. is_popular = true when followers > 100
      profile.is_popular = profile.followers > 100;

      return profile;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('GitHub user not found');
      }
      throw new Error(`Failed to fetch user data: ${error.message}`);
    }
  }
};

module.exports = githubService;
